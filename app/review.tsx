import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, ScrollView, View, Modal, Linking, TouchableOpacity } from 'react-native';
import { Image } from "expo-image";
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ResetDataButton from '@/components/ResetProgressButton';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import { KanaCharacter, KanaLearningData } from '@/data/types';

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

const LEARNING_DATA_KEY = 'kanaLearningData';

const buyMeCoffeUrl = 'https://buymeacoffee.com/novasphinx';


const Review = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [learningData, setLearningData] = useState<KanaLearningData[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedData = await AsyncStorage.getItem(LEARNING_DATA_KEY);
                if (storedData) {
                    const parsedData: KanaLearningData[] = await JSON.parse(storedData);
                    const processedData: KanaLearningData[] = parsedData.map(item => ({
                        ...item,
                        lastReviewed: item.lastReviewed ? new Date(item.lastReviewed) : null,
                        correctStreak: typeof item.correctStreak === "string" ? parseInt(item.correctStreak, 10) : item.correctStreak,
                        incorrectStreak: typeof item.incorrectStreak === "string" ? parseInt(item.incorrectStreak, 10) : item.incorrectStreak,
                        interval: typeof item.interval === "string" ? parseInt(item.interval, 10) : item.interval,
                        correctCount: typeof item.correctCount === "string" ? parseInt(item.correctCount, 10) : item.correctCount,
                        incorrectCount: typeof item.incorrectCount === "string" ? parseInt(item.incorrectCount, 10) : item.incorrectCount,
                        timeSpent: typeof item.timeSpent === "string" ? parseInt(item.timeSpent, 10) : item.timeSpent,
                        isCompleted: typeof item.isCompleted === "string" ? item.isCompleted === "true" : item.isCompleted
                    }));
                    setLearningData(processedData);
                } else {
                    throw new Error("No stored learning data!");
                }
            } catch (e: unknown) {
                if (e instanceof Error) {
                    console.error(e.message);
                }
            }
        };

        fetchData();
    }, []);

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

    const round = (value: number, precision: number) => {
        const pow = Math.pow(10, precision);
        return Math.floor(value * pow) / pow;
    };

    const formatTime = (timeMs: number) => {
        const s = timeMs / 1000;
        if (s < 60) {
            return `${round(s, 2)}s`;
        } else if (s < 3600) {
            return `${round(s / 60, 2)}m`;
        } else {
            return `${round(s / 3600, 2)}h`;
        }
    };

    const handleBuyMeCoffee = () => {
        Linking.openURL(buyMeCoffeUrl).catch((err) => console.error("Error: ", err));
    };

    return (
        <LinearGradient
            colors={["#8166E2", "#ABA1A1"]}
            style={styles.container}>

            <Modal
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
                animationType='slide'
                presentationStyle='pageSheet'
            >
                <View style={styles.modal}>
                    <View style={[styles.row, { backgroundColor: '#8166E2' }]}>
                        <View style={[styles.column, styles.modalColumn, { width: "20%" }]}><Text style={styles.modalCell}>kana</Text></View>
                        <View style={[styles.column, styles.modalColumn]}><Text style={styles.modalCell}>correct</Text></View>
                        <View style={[styles.column, styles.modalColumn]}><Text style={styles.modalCell}>incorrect</Text></View>
                        <View style={[styles.column, styles.modalColumn, { width: "30%" }]}><Text style={styles.modalCell}>time spent</Text></View>
                    </View>

                    <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
                        {
                            learningData.map((item, index) => (
                                <View key={index} style={styles.row}>
                                    <View style={[styles.column, styles.modalColumn, { width: "20%" }]}><Text>{item.character}</Text></View>
                                    <View style={[styles.column, styles.modalColumn]}><Text>{item.correctCount}</Text></View>
                                    <View style={[styles.column, styles.modalColumn]}><Text>{item.incorrectCount}</Text></View>
                                    <View style={[styles.column, styles.modalColumn, { width: "30%" }]}><Text>{formatTime(item.timeSpent)}</Text></View>
                                </View>
                            ))
                        }
                    </ScrollView>
                </View>
            </Modal>

            <ScrollView>
                <Text style={styles.title}>Awesome</Text>
                <Text style={[styles.text, styles.h1]}>You've made it!</Text>

                <Button title="My Learning Statistics" style={styles.statsButton}
                    onPress={() => setIsModalVisible(true)} />

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
                    🎯 Want to learn more about Japanes kana?
                    {"\n "}🌐 https://en.wikipedia.org/wiki/Kana
                    {"\n "}🌐 https://learnthekana.com/
                    {"\n "}🌐 https://kana-quiz.tofugu.com/
                    {"\n "}🌐 https://kana.pro/
                </Text>

                <View style={styles.buyMeCoffeeContainer}>
                    <Text style={[styles.text, { fontWeight: 'bold', marginVertical: 10, fontSize: 24}]}>
                        Finding useful?
                    </Text>

                    <TouchableOpacity onPress={handleBuyMeCoffee}>
                        <Image source={require("../assets/images/coffee.png")} style={styles.coffeeIamge} />
                    </TouchableOpacity>
                </View>

                <ResetDataButton title="Start Over" style={styles.button} onReset={handleReset} />

            </ScrollView>
        </LinearGradient >
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
    },
    statsButton: {
        fontSize: 20,
        width: 220,
        padding: 10,
        marginBottom: 20,
    },
    modal: {
        flex: 1,
        height: '100%',
        padding: 20,
        textAlign: 'center',
        backgroundColor: "#c4b8f0",
        alignItems: 'center',
        paddingTop: 30,
        width: "100%",
        margin: 0,
    },
    modalScroll: {
        width: "100%",
        margin: 0,
    },
    modalContent: {
        alignItems: 'center',
        margin: 0,
    },
    modalColumn: {
        width: "25%",
    },
    modalCell: {
        color: 'white',
    },
    buyMeCoffeeContainer: {
        alignItems: 'center',
    },
    coffeeIamge: {
        width: 220,
        height: 60,
        resizeMode: 'contain'
    },
});

export default Review;


