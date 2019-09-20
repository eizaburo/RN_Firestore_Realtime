import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import Firebase, { db } from './config/Firebase';

//FieldValue.serverTimestamp()つかうために別途import

import firebase from 'firebase';

export default class App extends React.Component {

    state = {
        name: 'xxx',
        point: 0,
        sub_init: false, //起動時のサブスクライブが行われたらtrueに設定（初回コールを判定するため）
    }

    componentDidMount() {

        //collectionをサブスクライブ
        this.colRef = db.collection('users');
        this.col_unsubscribe = this.colRef.onSnapshot(this.onCollectionUpdate);

        //docをサブスクライブ
        this.docRef = db.collection('users').doc('12345');
        this.doc_unsubscribe = this.docRef.onSnapshot(this.onDocumentUpdate);
    }

    componentWillUnmount() {

        //サブスクライブ解除
        this.col_unsubscribe();
        this.doc_unsubscribe();
    }

    //Collection変更時のコールバック
    onCollectionUpdate = (queryShapshot) => {
        const col = queryShapshot.docs.map((doc) => {
            console.log("ColUpdate:" + JSON.stringify(doc.data()));
        });
    }

    //Document更新時のコールバック
    onDocumentUpdate = (queryShapshot) => {

        //どこから更新されたかを判定
        let source = queryShapshot.metadata.hasPendingWrites ? "Local" : "Server";
        console.log(source);
        console.log("DocUpdate:" + JSON.stringify(queryShapshot.data()));

        //表示にリアルタム反映
        this.setState({
            name: queryShapshot.data().name,
            point: queryShapshot.data().point,
        });

        // if (source == "Local") {
        //起動時に一度実行されてしまうのを防いてる
        if (this.state.sub_init) {
            alert("ポイントが加算されました。")
        }

        //初回falseからtrueへ（あとはずっとtrue）
        this.setState({ sub_init: true });
    }

    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>App</Text>
                <Button
                    title="add user"
                    onPress={() => {
                        //コレクションに無作為にデータ追加
                        db.collection('users').add({
                            name: 'xxx',
                            point: 0,
                            create_at: firebase.firestore.FieldValue.serverTimestamp(),
                        })
                            .then(res => console.log('success'))
                            .then(e => console.log(e));
                    }}
                />
                <Button
                    title="add point"
                    onPress={() => {
                        //指定したdocのpointに加算
                        db.collection('users').doc('12345').update({
                            point: this.state.point + 1,
                        })
                    }}
                />
                <Text>Name(Realtime):{this.state.name}</Text>
                <Text>Point(Realtime):{this.state.point}</Text>
            </View>
        );
    }
}