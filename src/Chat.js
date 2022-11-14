import React, { useEffect, useState, useRef } from "react";
import { Avatar, IconButton } from "@material-ui/core";
// three0
import { Database, Auth } from '@three0dev/js-sdk';
import { env } from './env';
// three0
import AttachFile from "@material-ui/icons/AttachFile";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import SearchOutlined from "@material-ui/icons/SearchOutlined";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import MicIcon from "@material-ui/icons/Mic";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import db from "./firebase";
import firebase from "firebase";
import "./Chat.css";
import { Link, useParams } from "react-router-dom";
import { useStateValue } from "./StateProvider";
import { actionTypes } from "./reducer";
import UseWindowDimensions from "./UseWindowDimensions";
import useSound from "use-sound";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import Linkify from "react-linkify";
import { toHaveFormValues } from "@testing-library/jest-dom";
import { MessageSharp } from "@material-ui/icons";

function Chat() {
  const [seed, setSeed] = useState("");
  const [input, setInput] = useState("");
  const { roomId } = useParams();
  const [roomName, setRoomName] = useState("");
  const [messages, setMessages] = useState([]);
  // three0
  const [roomsRef, setRoomsRef] = React.useState(null);
  // three0
  const [toggler, setToggler] = useState(true);
  const displayName = Auth.getAccountId().replace('.testnet', '  ');
  const [{ togglerState }, dispatch] = useStateValue();
  const [{ photoURL }] = useStateValue();
  const [emoji, setEmoji] = useState(false);
  const [issendChecked, setIssendChecked] = useState(false);
  const [datewise, setDateWise] = useState([]);
  const [clientGMT, setClinetGMT] = useState("");
  const [lastseenPhoto, setLastseen] = useState("");
  // const [isRecChecked, setIsRecChecked]=useState(1);
  const { width } = UseWindowDimensions();



  var hour = 0,
    extramin = 0,
    minutes = 0,
    hourly = 0,
    GMTminutes = String(clientGMT).slice(4, 6),
    scrl,
    fix = 0;
  // console.log(GMTminutes)

  //console.log(roomId);

  const [playOn] = useSound(`${process.env.PUBLIC_URL}/send.mp3`, {
    volume: 0.5,
  });
  const [playOff] = useSound(`${process.env.PUBLIC_URL}/send.mp3`, {
    volume: 0.5,
  });

  const addEmoji = (e) => {
    let emoji = e.native;
    setInput(input + emoji);
  };
  const checkEmojiClose = () => {
    if (emoji) {
      setEmoji(false);
    }
  };

  function getTimeZone() {
    var offset = new Date().getTimezoneOffset(),
      o = Math.abs(offset);
    return (
      (offset < 0 ? "+" : "-") +
      ("00" + Math.floor(o / 60)).slice(-2) +
      ":" +
      ("00" + (o % 60)).slice(-2)
    );
  }

  useEffect(() => {
    setClinetGMT(getTimeZone());
    //  console.log(clientGMT);
  }, []);
  useEffect(() => {
    setSeed(Math.floor(Math.random() * 5000));
    if (roomId) {
      Database.KeyValue(env.chatAppDBURL).then((keyVal) => {
        setRoomsRef(keyVal);
        try{
        setMessages(keyVal.database.get(roomId).messages);
        setRoomName(keyVal.database.get(roomId).name);
        
        } catch (error){
          // If roomId does not exist in current database
          // must add it to db, then try (to get messages) again
          // remove try block during code cleanup
          if (error instanceof TypeError){
          keyVal.set(roomId, {
            id : roomId,
            name: "roomName",
            timestamp: Database.timestamp(),
            createdAt: Database.timestamp(),
            messages: []
           })
          }
        }
        keyVal.onChange(() => {
           console.log("change detected");
           setRoomName(keyVal.database.get(roomId).name); 
           setMessages(keyVal.database.get(roomId).messages);
         });
       })

      // firebase (room setting)
      // db.collection("rooms")
      //   .doc(roomId)
      //   .onSnapshot((snapshot) => {
      //     setRoomName(snapshot.data().name);
      //   });

      // firebase (message setting per room)
      // db.collection("rooms")
      //   .doc(roomId)
      //   .collection("messages")
      //   .orderBy("timestamp", "asc")
      //   .onSnapshot((snapshot) => {
      //     setMessages(snapshot.docs.map((doc) => doc.data()));
      //   });
    }
  }, [roomId]);
  useEffect(() => {
    setLastseen(messages[messages.length - 1]?.photoURL);
  }, [messages]);

  //  console.log(lastseenPhoto);

// three0
// React.useEffect(() => {
//   Database.KeyValue(env.chatAppDBURL).then((keyVal) => {
//   console.log("testers");
//   setMessagesRef(keyVal);
//   try{
//   setMessages(keyVal.database.get(roomId).messages);
//   } catch (error){
//     // If roomId does not exist in current database
//     // must add it to db, then try (to get messages) again
//     // remove try block during code cleanup
//     if (error instanceof TypeError){
//       // adding new room
//       keyVal.set(roomId,  
//         { name: "newRoomName",
//         id: roomId, 
//         timestamp: Database.timestamp(),
//         messages : []
//       });
//       console.log("adding room ", roomId);
//       // updating messages
//       setMessages(keyVal.database.get(roomId).messages);   
//     }
//   }
//   keyVal.onChange(() => {
//      // console.log("change detected");
//      setMessages(keyVal.database.get(roomId).messages);
//    });
//  })
// }, []);
// three0


  // firebase -> three0
  const sendMessage = async (e) => {
    // alert("you just sent a message");
    e.preventDefault();
    // console.log("You Typedd >>>>",input);
    if (input.length > 1){
      const uid = Auth.getAccountId();
      // three0 payload. createdAt attribute is needed to be
      // registered in their db. timestamp is the attribute name used
      // by the rest of the application. too inconvenient to all of code
      // to reference "createdAt".
      const payload = {
        message: input,
        name: uid.replace('.testnet', '  '),
        photoURL: localStorage.getItem("photoURL"),
        createdAt: Database.timestamp(),
        timestamp: Database.timestamp(),
        uid
      };
      const roomObj = await roomsRef.database.get(roomId);
      roomObj.messages.push(payload);
      setMessages([...roomObj.messages]);

      const id = await roomsRef.set(roomId, roomObj);

    //   firebase
    //   if (input.length > 0) {
    //     db.collection("rooms")
    //       .doc(roomId)
    //       .collection("messages")
    //       .add({
    //         message: input,
    //         name: displayName,
    //         timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    //         photoURL: localStorage.getItem("photoURL"),
    //       });
    // }
      setIssendChecked(!issendChecked);
      issendChecked ? playOff() : playOn();
      setInput("");
    }
    // }
  };
  let blankObj = {};
  let TotalObj = [];
  if (messages.length > 0) {
    // for( const message in messages)

    // }
    let checkDate = "";
    let blankArray = [];
    let dateArray = [];
    messages.forEach(function (message, i) {
      let messageDate = String(
        new Date(message.timestamp)
      ).slice(4, 11);
      if (dateArray.indexOf(messageDate) === -1) {
        dateArray.push(messageDate);
      }
    });
    //let tempObj={};
    var index = 0;
    messages.forEach(function (message, i) {
      let messageDate = String(
        new Date(message.timestamp)
      ).slice(4, 11);
      // console.log((message.timestamp+new Date()?.getTimezoneOffset()))
      if (messageDate === dateArray[index] && i == messages.length - 1) {
        blankArray.push({
          messageData: message.message,
          name: message.name,
          timestamp: message.timestamp,
        });
        blankObj[dateArray[index]] = blankArray;
        TotalObj.push(blankObj);
        blankObj = {};
        blankArray = [];
        blankArray.push({
          messageData: message.message,
          name: message.name,
          timestamp: message.timestamp,
        });
        index = index + 1;
      } else if (messageDate == dateArray[index]) {
        blankArray.push({
          messageData: message.message,
          name: message.name,
          timestamp: message.timestamp,
        });
      } else {
        blankObj[dateArray[index]] = blankArray;
        TotalObj.push(blankObj);
        blankObj = {};
        blankArray = [];
        blankArray.push({
          messageData: message.message,
          name: message.name,
          timestamp: message.timestamp,
        });
        if (messageDate != dateArray[index] && i == messages.length - 1) {
          blankObj[messageDate] = blankArray;
          TotalObj.push(blankObj);
        }
        index = index + 1;
      }
    });
  }
  useEffect(() => {
    setDateWise(TotalObj);
  }, [messages]);
  //  console.log(TotalObj);
  // if(Object.keys(datewise).length !== 0){
  //     Object.entries(datewise).forEach(
  //         ([key, value]) => {
  //             console.log(key);
  //             value.forEach((item,i)=>{
  //                 console.log(item.messageData,item.name);
  //             });
  //         }
  //     );
  // }

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    // console.log('called')
  };
  useEffect(() => {
    scrollToBottom();
  });

  useEffect(() => {
    setToggler(!toggler);
  }, [togglerState]);

  useEffect(() => {
    scrollToBottom();
    //   scrl= document.getElementById("chat__box")
    //  console.log(messagesEndRef.current.clientHeight);
    //  scrl.scrollIntoView(false);
  }, [messages]);
  const handleDrawerToggle = () => {
    setToggler(!toggler);
    dispatch({
      type: actionTypes.SET_TOGGLER,
      togglerState: togglerState + 1,
    });
  };
  return (
    <>
      {width < 629 ? (
        <div className={togglerState % 2 === 0 ? "chat" : "chat hide__chat"}>
          <div className="chat__header">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <ArrowBackIcon />
            </IconButton>
            <Avatar src={lastseenPhoto} />
            <div className="chat__headerInfo">
              <h3>{roomName}</h3>
              <p className="header__lastSeen">
                last seen{" "}
                {messages.length !== 0
                  ? new Date (messages[messages.length - 1].timestamp)
                  : "Loading"}
              </p>
            </div>
            <div className="chat__headerRight">
              <IconButton>
                <SearchOutlined />
              </IconButton>
              <IconButton>
                <AttachFile />
              </IconButton>
              <IconButton>
                <MoreVertIcon />
              </IconButton>
            </div>
          </div>
          <div className="chat__header__absolute">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <ArrowBackIcon />
            </IconButton>
            <Avatar src={lastseenPhoto} />
            <div className="chat__headerInfo">
              <h3>{roomName}</h3>
              <p className="header__lastSeen">
                last seen{" "}
                {messages.length !== 0
                  ? String(
                      new Date(messages[messages.length - 1].timestamp)
                    ).slice(0, 22)
                  : "Loading"}
              </p>
            </div>
            <div className="chat__headerRight">
              <IconButton>
                <SearchOutlined />
              </IconButton>
              <IconButton>
                <AttachFile />
              </IconButton>
              <IconButton>
                <MoreVertIcon />
              </IconButton>
            </div>
          </div>
          <div className="chat__body">
            {datewise.length > 0
              ? datewise.map(
                  (item, i) =>
                    //  <div className="chat__body__daystamp">
                    //     <p className="chat__body__daystamp__title">{Object.keys(item)}</p>
                    //  </div>
                    item[Object.keys(item)].map((e, i) =>
                      i == 0 ? (
                        <>
                          {String(Object.keys(item)).slice(0, 2) !== "id" &&
                          parseInt(String(Object.keys(item)).slice(0, 2)) ? (
                            <div className="chat__body__daystamp">
                              <p className="chat__body__daystamp__title">
                                {parseInt(
                                  String(Object.keys(item)).slice(0, 2)
                                ) == parseInt(String(new Date().getDate()))
                                  ? "TODAY"
                                  : Object.keys(item)}
                              </p>
                            </div>
                          ) : null}
                          <p
                            className={`chat__messages ${
                              e.name === displayName && "chat__reciever"
                            }`}
                          >
                            <span className="chat__name">
                              {e.name.substr(0, e.name.indexOf(" "))}
                            </span>
                            <Linkify>{e.messageData}</Linkify>
                            <span className="chat__timestamp">
                              <div className="hidden">
                                {
                                  (extramin =
                                    parseInt(
                                      String(
                                        new Date(
                                          e.timestamp
                                        ).toUTCString()
                                      ).slice(20, 22)
                                    ) +
                                      parseInt(GMTminutes) >
                                    60
                                      ? (parseInt(
                                          String(
                                            new Date(
                                              e.timestamp
                                            ).toUTCString()
                                          ).slice(20, 22)
                                        ) +
                                          parseInt(GMTminutes)) %
                                        60
                                      : 0)
                                }

                                {
                                  (minutes =
                                    parseInt(
                                      String(
                                        new Date(
                                          e.timestamp
                                        ).toUTCString()
                                      ).slice(20, 22)
                                    ) +
                                      parseInt(GMTminutes) +
                                      extramin -
                                      fix >
                                    60
                                      ? (parseInt(
                                          String(
                                            new Date(
                                              e.timestamp
                                            ).toUTCString()
                                          ).slice(20, 22)
                                        ) +
                                          parseInt(GMTminutes) +
                                          extramin -
                                          fix) %
                                        60
                                      : parseInt(
                                          String(
                                            new Date(
                                              e.timestamp
                                            ).toUTCString()
                                          ).slice(20, 22)
                                        ) +
                                        parseInt(GMTminutes) +
                                        extramin -
                                        fix)
                                }
                                {(hour = extramin > 0 ? 1 : 0)}

                                {
                                  (hourly =
                                    parseInt(
                                      String(
                                        new Date(
                                          e.timestamp
                                        ).toUTCString()
                                      ).slice(17, 19)
                                    ) +
                                      hour +
                                      parseInt(clientGMT) <
                                    0
                                      ? (parseInt(
                                          String(
                                            new Date(
                                              e.timestamp
                                            ).toUTCString()
                                          ).slice(17, 19)
                                        ) +
                                          hour +
                                          parseInt(clientGMT)) +
                                        24
                                      : parseInt(
                                          String(
                                            new Date(
                                              e.timestamp
                                            ).toUTCString()
                                          ).slice(17, 19)
                                        ) +
                                        hour +
                                        parseInt(clientGMT))
                                }
                              </div>
                              {hourly ? hourly % 12 : "00"}
                              {" : "}
                              {minutes !== 0
                                ? minutes < 10
                                  ? "0" + minutes
                                  : minutes
                                : "00"}
                              {hourly > 12 ? " PM" : " AM"}
                            </span>
                          </p>
                        </>
                      ) : (
                        <p
                          className={`chat__messages ${
                            e.name === displayName && "chat__reciever"
                          }`}
                        >
                          <span className="chat__name">
                            {e.name.substr(0, e.name.indexOf(" "))}
                          </span>
                          <Linkify>{e.messageData}</Linkify>
                          <span className="chat__timestamp">
                            <div className="hidden">
                              {
                                (extramin =
                                  parseInt(
                                    String(
                                      new Date(
                                        e.timestamp
                                      ).toUTCString()
                                    ).slice(20, 22)
                                  ) +
                                    parseInt(GMTminutes) >
                                  60
                                    ? (parseInt(
                                        String(
                                          new Date(
                                            e.timestamp
                                          ).toUTCString()
                                        ).slice(20, 22)
                                      ) +
                                        parseInt(GMTminutes)) %
                                      60
                                    : 0)
                              }

                              {
                                (minutes =
                                  parseInt(
                                    String(
                                      new Date(
                                        e.timestamp
                                      ).toUTCString()
                                    ).slice(20, 22)
                                  ) +
                                    parseInt(GMTminutes) +
                                    extramin -
                                    fix >
                                  60
                                    ? (parseInt(
                                        String(
                                          new Date(
                                            e.timestamp
                                          ).toUTCString()
                                        ).slice(20, 22)
                                      ) +
                                        parseInt(GMTminutes) +
                                        extramin -
                                        fix) %
                                      60
                                    : parseInt(
                                        String(
                                          new Date(
                                            e.timestamp
                                          ).toUTCString()
                                        ).slice(20, 22)
                                      ) +
                                      parseInt(GMTminutes) +
                                      extramin -
                                      fix)
                              }
                              {(hour = extramin > 0 ? 1 : 0)}

                              {
                                (hourly =
                                  parseInt(
                                    String(
                                      new Date(
                                        e.timestamp
                                      ).toUTCString()
                                    ).slice(17, 19)
                                  ) +
                                    hour +
                                    parseInt(clientGMT) <
                                  0
                                    ? (parseInt(
                                        String(
                                          new Date(
                                            e.timestamp
                                          ).toUTCString()
                                        ).slice(17, 19)
                                      ) +
                                        hour +
                                        parseInt(clientGMT)) +
                                      24
                                    : parseInt(
                                        String(
                                          new Date(
                                            e.timestamp
                                          ).toUTCString()
                                        ).slice(17, 19)
                                      ) +
                                      hour +
                                      parseInt(clientGMT))
                              }
                            </div>
                            {hourly ? hourly % 12 : "00"}
                            {" : "}
                            {minutes !== 0
                              ? minutes < 10
                                ? "0" + minutes
                                : minutes
                              : "00"}
                            {hourly > 12 ? " PM" : " AM"}
                          </span>
                        </p>
                      )
                    )
                  //  console.log(Object.keys(item))
                  // console.log(item[Object.keys(item)])
                )
              : // <div className="chat__body__daystamp">
                //     <p className="chat__body__daystamp__title"></p>
                //  </div>
                // Object.entries(datewise).forEach(
                //     ([key, value]) => {

                //     {
                //     value.forEach((item,i)=>{
                //             console.log(item.messageData,item.name)
                //         })
                //     }
                // }
                // )

                null}
            <div ref={messagesEndRef}></div>
          </div>

          <div className="chat__footer">
            {/* <InsertEmoticonIcon onClick={<Picker onSelect={addEmoji} />}/> */}
            <IconButton>
              {/* <InsertEmoticonIcon /> */}
              <InsertEmoticonIcon
                className="yellow"
                onClick={() => setEmoji(!emoji)}
              />
              {emoji ? <Picker onSelect={addEmoji} /> : null}
            </IconButton>
            {/* <span>
                                <Picker onSelect={addEmoji} />
                            </span> */}

            <form>
              <input
                value={input}
                type="text"
                placeholder="Type a message"
                onChange={(e) => setInput(e.target.value)}
                onClick={checkEmojiClose}
                disabled={
                  roomName === "Admin: Ali"
                    ? (displayName == "Shekh Aliul WqnNsFNEPr" ? true : false)
                      ? false
                      : true
                    : false
                }
              />
              <button type="submit" onClick={sendMessage}>
                Send A message
              </button>
            </form>
            <IconButton>
              <MicIcon />
            </IconButton>
          </div>

          <div className="chat__footer__absolute">
            <IconButton>
              <InsertEmoticonIcon />
            </IconButton>
            <form>
              <input
                value={input}
                type="text"
                placeholder="Type a message"
                onChange={(e) => setInput(e.target.value)}
                disabled={roomName == "Admin: Ali" ? true : false}
              />
              <button type="submit" onClick={sendMessage}>
                Send A message
              </button>
            </form>
            <IconButton>
              <MicIcon />
            </IconButton>
          </div>
        </div>
      ) : (
        <div className={"chat"}>
          <div className="chat__header">
            <Avatar src={lastseenPhoto} />
            <div className="chat__headerInfo">
              <h3>{roomName}</h3>
              <p className="header__lastSeen">
                last seen{" "}
                {messages.length !== 0
                  ? String(
                    new Date(
                      messages[messages.length - 1].timestamp)
                    ).slice(0, 11)
                  : "Loading"}
              </p>
            </div>
            <div className="chat__headerRight">
              <IconButton>
                <SearchOutlined />
              </IconButton>
              <IconButton>
                <AttachFile />
              </IconButton>
              <IconButton>
                <MoreVertIcon />
              </IconButton>
            </div>
          </div>
          <div
            className="chat__body scrollbar-juicy-peach"
            onClick={checkEmojiClose}
          >
            {datewise.length > 0
              ? datewise.map(
                  (item, i) =>
                    item[Object.keys(item)].map((e, i) =>
                      i == 0 ? (
                        <>
                          {String(Object.keys(item))?.slice(0, 2) !== "id" &&
                          Object.keys(item) != undefined ? (
                            <div className="chat__body__daystamp">
                              <p className="chat__body__daystamp__title">
                                {parseInt(
                                  String(Object.keys(item)).slice(0, 2)
                                ) == parseInt(String(new Date().getDate()))
                                  ? "TODAY"
                                  : Object.keys(item)}
                              </p>
                            </div>
                          ) : (
                            ""
                          )}
                          <p
                            className={`chat__messages ${
                              e.name === displayName && "chat__reciever"
                            }`}
                          >
                            <span className="chat__name">
                              {e.name.substr(0, e.name.indexOf(" "))}
                            </span>
                            <Linkify
                              properties={{
                                target: "_blank",
                                style: { color: "red", fontWeight: "bold" },
                              }}
                            >
                              {e.messageData}
                            </Linkify>
                            <span className="chat__timestamp">
                              <div className="hidden">
                                {
                                  (extramin =
                                    parseInt(
                                      String(
                                        new Date(
                                          e.timestamp
                                        ).toUTCString()
                                      ).slice(20, 22)
                                    ) +
                                      parseInt(GMTminutes) >
                                    60
                                      ? (parseInt(
                                          String(
                                            new Date(
                                              e.timestamp
                                            ).toUTCString()
                                          ).slice(20, 22)
                                        ) +
                                          parseInt(GMTminutes)) %
                                        60
                                      : 0)
                                }

                                {
                                  (minutes =
                                    parseInt(
                                      String(
                                        new Date(
                                          e.timestamp
                                        ).toUTCString()
                                      ).slice(20, 22)
                                    ) +
                                      parseInt(GMTminutes) +
                                      extramin -
                                      fix >
                                    60
                                      ? (parseInt(
                                          String(
                                            new Date(
                                              e.timestamp
                                            ).toUTCString()
                                          ).slice(20, 22)
                                        ) +
                                          parseInt(GMTminutes) +
                                          extramin -
                                          fix) %
                                        60
                                      : parseInt(
                                          String(
                                            new Date(
                                              e.timestamp
                                            ).toUTCString()
                                          ).slice(20, 22)
                                        ) +
                                        parseInt(GMTminutes) +
                                        extramin -
                                        fix)
                                }
                                {(hour = extramin > 0 ? 1 : 0)}

                                {
                                  (hourly =
                                    parseInt(
                                      String(
                                        new Date(
                                          e.timestamp
                                        ).toUTCString()
                                      ).slice(17, 19)
                                    ) +
                                      hour +
                                      parseInt(clientGMT) <
                                    0
                                      ? (parseInt(
                                          String(
                                            new Date(
                                              e.timestamp
                                            ).toUTCString()
                                          ).slice(17, 19)
                                        ) +
                                          hour +
                                          parseInt(clientGMT)) +
                                        24
                                      : parseInt(
                                          String(
                                            new Date(
                                              e.timestamp
                                            ).toUTCString()
                                          ).slice(17, 19)
                                        ) +
                                        hour +
                                        parseInt(clientGMT))
                                }
                              </div>
                              {hourly ? hourly % 12 : "00"}
                              {" : "}
                              {minutes !== 0
                                ? minutes < 10
                                  ? "0" + minutes
                                  : minutes
                                : "00"}
                              {hourly > 12 ? " PM" : " AM"}
                            </span>
                          </p>
                        </>
                      ) : (
                        <p
                          className={`chat__messages ${
                            e.name === displayName && "chat__reciever"
                          }`}
                        >
                          <span className="chat__name">
                            {e.name.substr(0, e.name.indexOf(" "))}
                          </span>
                          <Linkify>{e.messageData}</Linkify>
                          <span className="chat__timestamp">
                            <div className="hidden">
                              {
                                (extramin =
                                  parseInt(
                                    String(
                                      new Date(
                                        e.timestamp
                                      ).toUTCString()
                                    ).slice(20, 22)
                                  ) +
                                    parseInt(GMTminutes) >
                                  60
                                    ? (parseInt(
                                        String(
                                          new Date(
                                            e.timestamp
                                          ).toUTCString()
                                        ).slice(20, 22)
                                      ) +
                                        parseInt(GMTminutes)) %
                                      60
                                    : 0)
                              }

                              {
                                (minutes =
                                  parseInt(
                                    String(
                                      new Date(
                                        e.timestamp
                                      ).toUTCString()
                                    ).slice(20, 22)
                                  ) +
                                    parseInt(GMTminutes) +
                                    extramin -
                                    fix >
                                  60
                                    ? (parseInt(
                                        String(
                                          new Date(
                                            e.timestamp
                                          ).toUTCString()
                                        ).slice(20, 22)
                                      ) +
                                        parseInt(GMTminutes) +
                                        extramin -
                                        fix) %
                                      60
                                    : parseInt(
                                        String(
                                          new Date(
                                            e.timestamp
                                          ).toUTCString()
                                        ).slice(20, 22)
                                      ) +
                                      parseInt(GMTminutes) +
                                      extramin -
                                      fix)
                              }
                              {(hour = extramin > 0 ? 1 : 0)}

                              {
                                (hourly =
                                  parseInt(
                                    String(
                                      new Date(
                                        e.timestamp
                                      ).toUTCString()
                                    ).slice(17, 19)
                                  ) +
                                    hour +
                                    parseInt(clientGMT) < 
                                  0
                                    ? (parseInt(
                                        String(
                                          new Date(
                                            e.timestamp
                                          ).toUTCString()
                                        ).slice(17, 19)
                                      ) +
                                        hour +
                                        parseInt(clientGMT)) +
                                      24
                                    : parseInt(
                                        String(
                                          new Date(
                                            e.timestamp
                                          ).toUTCString()
                                        ).slice(17, 19)
                                      ) +
                                      hour +
                                      parseInt(clientGMT))
                              }
                            </div>
                            {hourly ? hourly % 12 : "00"}
                            {" : "}
                            {minutes !== 0
                              ? minutes < 10
                                ? "0" + minutes
                                : minutes
                              : "00"}
                            {hourly > 12 ? " PM" : " AM"}
                          </span>
                        </p>
                      )
                    )
                  //  console.log(Object.keys(item))
                  // console.log(item[Object.keys(item)])
                )
              : // <div className="chat__body__daystamp">
                //     <p className="chat__body__daystamp__title"></p>
                //  </div>
                // Object.entries(datewise).forEach(
                //     ([key, value]) => {

                //     {
                //     value.forEach((item,i)=>{
                //             console.log(item.messageData,item.name)
                //         })
                //     }
                // }
                // )

                null}
            <div ref={messagesEndRef} id="chat__box"></div>
          </div>

          <div className="chat__footer">
            <IconButton>
              {/* <InsertEmoticonIcon /> */}
              <InsertEmoticonIcon
                className="yellow"
                onClick={() => setEmoji(!emoji)}
              />
              {emoji ? <Picker onSelect={addEmoji} /> : null}
            </IconButton>
            <form>
              <input
                value={input}
                type="text"
                placeholder="Type a message"
                onChange={(e) => setInput(e.target.value)}
                onClick={checkEmojiClose}
                disabled={
                  roomName === "Admin: Ali"
                    ? (displayName == "Shekh Aliul WqnNsFNEPr" ? true : false)
                      ? false
                      : true
                    : false
                }
              />
              <button type="submit" onClick={sendMessage}>
                Send A message
              </button>
            </form>
            <IconButton>
              <MicIcon />
            </IconButton>
          </div>
        </div>
      )}
    </>
  );
}

export default Chat;
