/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState,useEffect, useContext }from 'react';
import avatar from './dot.png'
import axios from 'axios';
import {
  FlatList,
  View,
  Text,
  Image,
  TextInput,
  ActivityIndicator,
  StyleSheet
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const styles = StyleSheet.create({
  item: {
    marginVertical: 8,
    padding:10,
    backgroundColor:'white'
  },
  name: {
    fontSize: 20,
    fontFamily:'Roboto',
    fontWeight:'500',
    marginStart:10
  },
  caption: {
    fontSize: 13,
    fontFamily:'Roboto',
    fontWeight:'100',
    marginTop:5
  },
  postimage:{
    height:300,
    width:null,
    flex:1
  },
  avatar:{
    width:30,
    height:30
  }
});
function Item({ item }) {
  return (
    <View style={styles.item}>
      <Image
        style={styles.postimage}
        resizeMode={"contain"}
        source={{
          uri: item.contentimageurl,
        }}
      />
      <View style={{flex: 1, flexDirection: 'row',marginTop:10}}>
          <Image source={avatar} style={styles.avatar} />
          <Text style={styles.name}>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</Text>
      </View>
      <Text style={styles.caption}>{item.contentText.charAt(0).toUpperCase() + item.contentText.slice(1)}</Text>
    </View>
  );
}

 export default function Main()
 {
  const [posts,setPosts]=useState([]);
  const [orignalPosts, setorignalPosts] = useState([])
  useEffect(() => {
    getPosts();
   }, []);
   useEffect(() => {
     if(posts.length!=0)
     {
      setisloading(false)
     }
   }, [posts]);
  const getPosts=()=>{
    axios({
      method: 'post',
      url: 'http://ec2-3-6-126-165.ap-south-1.compute.amazonaws.com:3000/onicares/posts',
      headers: {'Content-Type': 'application/x-www-form-urlencoded' }
      })
      .then(function (response) {
        if(response.status === 200) {
          let posts=[]
          posts=response.data.response
          posts.reverse()
          setPosts(posts)
          setorignalPosts(posts)
        }
        else
        {
          seterror("An error occured getting response from api call");
        }
      })
      .catch(function (response) {
          seterror("An error occured getting response from api call");
          console.log(response);
      });
  }
  function filterPost(text)
  {
    console.log(text)
    setText(text)
    if(text.length==0)
    {
      setPosts(orignalPosts)
    }
    else
    {
      setPosts(orignalPosts.filter(orignalPosts => orignalPosts.name.startsWith(text)));
    }
  }
  const [error, seterror] = useState("")
  const [isloading, setisloading] = useState(true)
  const [text, setText] = useState('');
  return (
    <View style={{padding:10,flex:1}}>
      <View> 
        <TextInput
          style={{height: 40}}
          placeholder="Type here to search post based on user."
          onChangeText={text => filterPost(text)}
          defaultValue={text}
          dis
        />
        <View
          style={{
            borderBottomColor: 'black',
            borderBottomWidth: 1,
          }}
        />
      </View>
       <View style={{alignItems: 'center',flex: 1,justifyContent: 'center'}}>
           <ActivityIndicator size="large" color="black" animating={isloading} />
       </View>
       <FlatList
        data={posts}
        renderItem={({ item }) => <Item item={item} />}
        keyExtractor={item => item.id}
      />
    </View>
  );
 }
