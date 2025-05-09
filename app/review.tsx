import React, { useReducer } from 'react';
import { Text, StyleSheet, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ResetDataButton from '@/components/ResetProgressButton';
import { useRouter } from 'expo-router';

const hiragana = [
    ['あ\na', 'い\ni', 'う\nu', 'え\ne', 'お\no'],
    ['か\nka', 'き\nki', 'く\nku', 'け\nke', 'こ\nko'],
    ['さ\nsa', 'し\nshi', 'す\nsu', 'せ\nse', 'そ\nso'],
    ['た\nta', 'ち\nchi', 'つ\ntsu', 'て\nte', 'と\nto'],
    ['な\nna', 'に\nni', 'ぬ\nnu', 'ね\nne', 'の\nno'],
    ['は\nha', 'ひ\nhi', 'ふ\nfu', 'へ\nhe', 'ほ\nho'],
    ['ま\nma', 'み\nmi', 'む\nmu', 'め\nme', 'も\nmo'],
    ['や\nya', '', 'ゆ\nyu', '', 'よ\nyo'],
    ['ら\nra', 'り\nri', 'る\nru', 'れ\nre', 'ろ\nro'],
    ['わ\nwa', '', '', '', 'を\nwo'],
    ['ん\nn', '', '', '', ''],
];

const katakana = [
    ['ア\na', 'イ\ni', 'ウ\nu', 'エ\ne', 'オ\no'],
    ['カ\nka', 'キ\nki', 'ク\nku', 'ケ\nke', 'コ\nko'],
    ['サ\nsa', 'シ\nshi', 'ス\nsu', 'セ\nse', 'ソ\nso'],
    ['タ\nta', 'チ\nchi', 'ツ\ntsu', 'テ\nte', 'ト\nto'],
    ['ナ\nna', 'ニ\nni', 'ヌ\nnu', 'ネ\nne', 'ノ\nno'],
    ['ハ\nha', 'ヒ\nhi', 'フ\nfu', 'ヘ\nhe', 'ホ\nho'],
    ['マ\nma', 'ミ\nmi', 'ム\nmu', 'メ\nme', 'モ\nmo'],
    ['ヤ\nya', '', 'ユ\nyu', '', 'ヨ\nyo'],
    ['ラ\nra', 'リ\nri', 'ル\nru', 'レ\nre', 'ロ\nro'],
    ['ワ\nwa', '', '', '', 'ヲ\nwo'],
    ['ン\nn', '', '', '', ''],
];

const hiraganaDakuten = [
    ['が\nga', 'ぎ\ngi', 'ぐ\ngu', 'げ\nge', 'ご\ngo'],
    ['ざ\nza', 'じ\nji', 'ず\nzu', 'ぜ\nze', 'ぞ\nzo'],
    ['だ\nda', 'ぢ\nji', 'づ\nzu', 'で\nde', 'ど\ndo'],
    ['ば\nba', 'び\nbi', 'ぶ\nbu', 'べ\nbe', 'ぼ\nbo'],
];

const hiraganaHandakuten = [
    ['ぱ\npa', 'ぴ\npi', 'ぷ\npu', 'ぺ\npe', 'ぽ\npo'],
];

const katakanaDakuten = [
    ['ガ\nga', 'ギ\ngi', 'グ\ngu', 'ゲ\nge', 'ゴ\ngo'],
    ['ザ\nza', 'ジ\nji', 'ズ\nzu', 'ゼ\nze', 'ゾ\nzo'],
    ['ダ\nda', 'ヂ\nji', 'ヅ\nzu', 'デ\nde', 'ド\ndo'],
    ['バ\nba', 'ビ\nbi', 'ブ\nbu', 'ベ\nbe', 'ボ\nbo'],
];

const katakanaHandakuten = [
    ['パ\npa', 'ピ\npi', 'プ\npu', 'ペ\npe', 'ポ\npo'],
];

const hiraganaYoon = [
    ['きゃ\nkya', 'きゅ\nkyu', 'きょ\nkyo'],
    ['しゃ\nsha', 'しゅ\nshu', 'しょ\nsho'],
    ['ちゃ\ncha', 'ちゅ\nchu', 'ちょ\ncho'],
    ['にゃ\nnya', 'にゅ\nnyu', 'にょ\nnyo'],
    ['ひゃ\nhya', 'ひゅ\nhyu', 'ひょ\nhyo'],
    ['みゃ\nmya', 'みゅ\nmyu', 'みょ\nmyo'],
    ['りゃ\nrya', 'りゅ\nryu', 'りょ\nryo'],
    ['ぎゃ\ngya', 'ぎゅ\ngyu', 'ぎょ\ngyo'],
    ['じゃ\nja', 'じゅ\nju', 'じょ\njo'],
    ['ぢゃ\nja', 'ぢゅ\nju', 'ぢょ\njo'], // Rarely used
    ['びゃ\nbya', 'びゅ\nbyu', 'びょ\nbyo'],
    ['ぴゃ\npya', 'ぴゅ\npyu', 'ぴょ\npyo'],
];

const katakanaYoon = [
    ['キャ\nkya', 'キュ\nkyu', 'キョ\nkyo'],
    ['シャ\nsha', 'シュ\nshu', 'ショ\nsho'],
    ['チャ\ncha', 'チュ\nchu', 'チョ\ncho'],
    ['ニャ\nnya', 'ニュ\nnyu', 'ニョ\nnyo'],
    ['ヒャ\nhya', 'ヒュ\nhyu', 'ヒョ\nhyo'],
    ['ミャ\nmya', 'ミュ\nmyu', 'ミョ\nmyo'],
    ['リャ\nrya', 'リュ\nryu', 'リョ\nryo'],
    ['ギャ\ngya', 'ギュ\ngyu', 'ギョ\ngyo'],
    ['ジャ\nja', 'ジュ\nju', 'ジョ\njo'],
    ['ヂャ\nja', 'ヂュ\nju', 'ヂョ\njo'], // Rarely used
    ['ビャ\nbya', 'ビュ\nbyu', 'ビョ\nbyo'],
    ['ピャ\npya', 'ピュ\npyu', 'ピョ\npyo'],
];


interface Props {
    data: string[][]
}


const Table = ({ data }: Props) => (
    <View style={styles.tableContainer}>
        {
            data.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                    {
                        row.map((item, columnIndex) => (
                            <View key={columnIndex} style={styles.column}>
                                <Text style={[styles.text, styles.cellText]}>
                                    {item}
                                </Text>
                            </View>
                        ))
                    }
                </View>
            ))
        }
    </View>
);

const Review = () => {
    const router = useRouter();

    const handleReset = async () => {
        // remove setting
        try {
            await AsyncStorage.removeItem('doNotShowWelcome');
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.error(e.message);
            }
        }

        // go back to welcome screen
        router.push('/');
    };

    return (
        <LinearGradient
            colors={["#8166E2", "#ABA1A1"]}
            style={styles.container}>
            <ScrollView>
                <Text style={styles.title}>Awesome</Text>
                <Text style={[styles.text, styles.h1]}>You've made it!</Text>
                <Text style={styles.text}>
                    Now let's see we've just learned{"\n"}
                </Text>

                <Text style={styles.text}>
                    ⚡ Hiragana{"\n"}
                    The most fundamental characters (notice in the table below, each column in the first row is a{" "}
                    <Text style={[styles.text, styles.emphasis]}>vowel</Text> and each row below stats with a{" "}
                    <Text style={[styles.text, styles.emphasis]}>consonant</Text>. ん, however, is special.
                    There are {" "}
                    <Text style={[styles.text, styles.emphasis]}>46</Text> of these.
                </Text>

                <Table data={hiragana} />

                <Text style={styles.text}>
                    ⚡ Katakana:{"\n"}
                    These are the more angular counterpart to hiragana. They are most commonly used for foreign names/words,
                    technical terms, and onomatopoeia. Pronunciation wise, they are completely the same as the hiragana.
                </Text>

                <Table data={katakana} />

                <Text style={styles.text}>
                    ⚡ Dakuten:{"\n"}
                    If you look carefully, you will see the little two dots (
                    <Text style={[styles.text, styles.emphasis]}>゛</Text>
                    ) to the upper right of the character,
                    which renders them pronunced differently.
                </Text>

                <Table data={hiraganaDakuten} />
                <Table data={katakanaDakuten} />

                <Text style={styles.text}>
                    ⚡ Handakuten:{"\n"}
                    The same goes with handakuten. But this time, characters are marked with what looks like a circle (
                    <Text style={[styles.text, styles.emphasis]}>゜</Text>
                    ).
                </Text>

                <Table data={hiraganaHandakuten} />
                <Table data={katakanaHandakuten} />

                <Text style={styles.text}>
                    ⚡ Yōon:{"\n"}
                    You can combine the{" "}
                    <Text style={[styles.text, styles.emphasis]}>i-column</Text> with each {" "}
                    <Text style={[styles.text, styles.emphasis]}>consonant row</Text>{" "}
                    (along with their Dakunten and Handakuten variants) to make what is called Yōon
                </Text>



                <Table data={hiraganaYoon} />
                <Table data={katakanaYoon} />

                <Text style={styles.text}>
                    💯 All right! Now you are ready to move onto the next phase of your Japanese learning.
                    Congrats and Best of Luck!{"\n"}
                </Text>

                <Text style={styles.text}>
                    ☕️ Want to learn more about Japanes kana?
                    {"\n "}🌐 https://en.wikipedia.org/wiki/Kana
                    {"\n "}🌐 https://learnthekana.com/
                    {"\n "}🌐 https://kana-quiz.tofugu.com/
                    {"\n "}🌐 https://kana.pro/
                </Text>

                <ResetDataButton title="Start Over" style={styles.button} onReset={handleReset} />

            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        width: "100%",
        height: "100%",
        paddingHorizontal: 20,
    },
    title: {
        paddingTop: 50,
        fontSize: 60,
        textAlign: "center",
        fontWeight: 100,
        color: '#fff',
    },
    text: {
        fontSize: 20,
        fontWeight: 200,
        color: '#fff',
        lineHeight: 30,
    },
    emphasis: {
        color: '#5A35DF',
        fontStyle: 'italic',
        fontWeight: 'bold'
    },
    h1: {
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 24,
        marginTop: 10,
        padding: 5,
    },
    tableContainer: {
        flex: 1,
        padding: 10,
        margin: "auto",
    },
    row: {
        flexDirection: 'row',
        width: "100%",
    },
    column: {
        width: "20%",
        borderWidth: 0.2,
        borderColor: "#ccc",
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cellText: {
        color: 'white',
        textAlign: 'center',
        lineHeight: 20,
    },
    button: {
        marginVertical: 20,
        borderRadius: 25,
        backgroundColor: 'crimson',
        color: 'white',
        fontSize: 24,
    }
});

export default Review;


