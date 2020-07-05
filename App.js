import React, { useState,useEffect, useContext }from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import ImagePicker from 'react-native-image-picker';
import avatar from './dot.png'
import axios from 'axios';
import storage from '@react-native-firebase/storage';
import {
  FlatList,
  View,
  Text,
  Image,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Keyboard
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
  imagetopost:{
    height:300,
    width:'100%'
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
      <Text style={styles.caption}>{item.contentText?item.contentText.charAt(0).toUpperCase() + item.contentText.slice(1):""}</Text>
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
   function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}
  const getPosts=()=>{
    setPosts([])
    axios({
      method: 'post',
      url: 'http://ec2-3-6-126-165.ap-south-1.compute.amazonaws.com:3000/onicares/posts',
      headers: {'Content-Type': 'application/x-www-form-urlencoded' }
      })
      .then(function (response) {
        if(response.status === 200) {
          let posts=[]
          posts=response.data.response
          posts.map((post)=>console.log(post.id))
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
  function launchImageLibrary (){
    setimageToPostUrl("")
    setcaption("")
    let options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
        alert(response.customButton);
      } else {
        setpathname(response.path)
        setimageToPostUrl(response.uri)
        setmodalVisible(true)
      }
    });

  }
  
  async function addpost()
  {
    setisPosting(true)
    Keyboard.dismiss()
    var uuid=create_UUID();
    const reference = storage().ref(uuid);
    await reference.putFile(pathname);
    const url = await storage().ref(uuid) .getDownloadURL();
    console.log(url)
    const queryString = require('query-string');
    axios({
      method: 'post',
      url: 'http://ec2-3-6-126-165.ap-south-1.compute.amazonaws.com:3000/onicares/addpost',
      data:queryString.stringify({ userid:1,contenttext:caption,contentimageurl:url }),
      headers: {'Content-Type': 'application/x-www-form-urlencoded' }
      })
      .then(function (response) {
        if(response.status === 200) {
          console.log(response.data)
          setisPosting(false)
          setmodalVisible(false)
          getPosts();
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
  const [isPosting, setisPosting] = useState(false)
  const [text, setText] = useState('');
  const [modalVisible, setmodalVisible] = useState(false)
  const [imageToPostUrl, setimageToPostUrl] = useState("")
  const [pathname, setpathname] = useState("")
  const [caption, setcaption] = useState("")
  return (
    <View style={{padding:10,flex:1,flexDirection:"column"}}>
      <View style={{height:"100%",display:isloading?'none':'flex'}}> 
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
        <FlatList
        data={posts}
        renderItem={({ item }) => <Item item={item} />}
        keyExtractor={item => item.id}
      />
      <TouchableOpacity
      style={{
          borderWidth:1,
          borderColor:'#FF5722',
          alignItems:'center',
          justifyContent:'center',
          width:70,
          position: 'absolute',                                          
          bottom: 10,                                                    
          right: 10,
          height:70,
          backgroundColor:'#FF5722',
          borderRadius:100,
        }}
        onPress={launchImageLibrary}
      >
      <Icon name="plus"  size={30} color="white" />
      </TouchableOpacity>
      </View>
       <View style={{alignItems: 'center',height:"100%",justifyContent: 'center'}}>
           <ActivityIndicator size="large" color="black" animating={isloading} />
       </View>
       
      
      <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => {
            setmodalVisible(false)
          }}>
          <View style={{flex:1}}>
            <View style={{ marginTop: 22,padding:10 ,display:isPosting?'none':'flex'}}>
              <Image style={styles.imagetopost} source={{uri:imageToPostUrl}} resizeMode={"contain"}/>
              <TextInput
                  style={{ height: 100, borderColor: 'gray', borderWidth: 1 ,marginTop:10,marginBottom:20,borderRadius:2}}
                  onChangeText={text => setcaption(text)}
                  placeholder="Add caption for upload"
                  value={caption}
                />
              <TouchableOpacity
                style={{
                    alignItems:'center',
                    justifyContent:'center',
                    width:"100%",
                    height:50,
                    backgroundColor:'black',
                  }}
                  onPress={()=>addpost()}
                >
                <Text style={{color:"white"}}>Add Post</Text>
             </TouchableOpacity>
            </View>
            <View style={{alignItems: 'center',flex: 1,justifyContent: 'center'}}>
                <ActivityIndicator size="large" color="black" animating={isPosting} />
            </View>
          </View>
        </Modal>
    </View>
  );
 }
