import React, { useState, useEffect } from "react";
import { Avatar, Collapse, IconButton } from "@material-ui/core";
import DonutLargeIcon from "@material-ui/icons/DonutLarge";
import ChatIcon from "@material-ui/icons/Chat";
import SearchOutlined from "@material-ui/icons/SearchOutlined";
import SidebarChat from "./SidebarChat";
import "./Sidebar.css";
import MenuIcon from "@material-ui/icons/Menu";
import db from "./firebase";
import { useStateValue } from "./StateProvider";
import { actionTypes } from "./reducer";
import UseWindowDimensions from "./UseWindowDimensions";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import Loader from "./Loader";
import { Auth, Database } from '@three0dev/js-sdk';
import { env } from "./env";
import { SettingsPowerSharp } from "@material-ui/icons";

function Sidebar() {
  const [roomsRef, setRoomsRef] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [toggler, setToggler] = useState(false);
  const [sidebarBool, setsidebarBool] = useState(true);
  const [{ togglerState }, dispatch] = useStateValue();
  const [search, setSearch] = useState([]);
  const [input, setInput] = useState("");
  
  // const [logout, setLogout] = useState(false); // previous
  const { width } = UseWindowDimensions();
  const matcher = (s, values) => {
    const re = RegExp(`.*${s.toLowerCase().split("").join(".*")}.*`);
    return values.filter((v) => v.data.name.toLowerCase().match(re));
  };
  const handleChange = (e) => {
    setsidebarBool(false);
    setInput(e.target.value);
  };
  const exitApp = async () => {
    //three0
    alert("logging out inna bit");
    Auth.logout();
    window.location.reload();
    //three0
    
    // previous
    // localStorage.removeItem("uid");
    // window.location.reload();
    // setLogout(true);
  };
  useEffect(() => {
    if (rooms.length > 0) {
      setSearch(matcher(input, rooms));
    }
    if (input === "") {
      setsidebarBool(true);
    }
  }, [input]);

  useEffect(() => {
    // const unsubscribe = Database.KeyValue(env.chatAppDBURL).then((keyVal) => {
    //   let roomObJs = Object.values(keyVal.getAll());
    //   setRooms(
    //     roomObJs.map((room_) => ({
    //       id: room_.id,
    //       data: room_,
    //     }))
    //   );
    // });

      const unsubscribe = db.collection("rooms")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        setRooms(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }))
        );
      });

    return () => {
      unsubscribe();
    };
  }, []);
  //console.log(rooms);
  useEffect(() => {
    setToggler(!toggler);
  }, [togglerState]);
  const handleDrawerToggle = () => {
    setToggler(toggler);

    dispatch({
      type: actionTypes.SET_TOGGLER,
      togglerState: togglerState + 1,
    });
  };
  const photoURL =
    localStorage.getItem("photoURL") !== ""
      ? localStorage.getItem("photoURL")
      : null;
  const displayName = localStorage.getItem("displayName");

  return (
    <>
      {width < 629 ? (
        <div
          className={
            togglerState % 2 !== 0 ? "sidebar" : "sidebar hide__sidebar"
          }
        >
          <div className="siderbar__wrapper">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              className="sidebar__burger"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
            <div className="sidebar__header">
              <Avatar src={photoURL} />{" "}
              <p className="sidebar__greeting mobile__tag">
                {" "}
                <a
                  href="https://three0dev.com/"
                  style={{ color: "purple" }}
                >
                  Made with <span style={{ color: "purple" }}>three0</span>
                </a>
              </p>
              <div className="sidebar__headerRight">
                <IconButton>
                  <DonutLargeIcon />
                </IconButton>
                <IconButton>
                  <ChatIcon />
                </IconButton>
                <IconButton>
                  <div onClick={exitApp}>
                    <ExitToAppIcon />
                  </div>
                </IconButton>
              </div>
            </div>
          </div>
          <div className="sidebar__search">
            <div className="sidebar__searchContainer">
              <SearchOutlined />
              <input
                placeholder="Search or Start a new chat"
                value={input}
                type="text"
                onChange={handleChange}
              />
            </div>
          </div>
          {sidebarBool ? (
            <div className="sidebar__chats">
              <SidebarChat addNewChatVal="true" />
              {rooms.map((room) => (
                <SidebarChat key={room.id} id={room.id} name={room.data.name} />
              ))}
            </div>
          ) : (
            <div className="sidebar__chats">
              <SidebarChat addNewChatVal="true" />
              {search.map((room) => (
                <SidebarChat key={room.id} id={room.id} name={room.data.name} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className={"sidebar"}>
          <div className="sidebar__header">
            <Avatar src={photoURL} />{" "}
            <p className="sidebar__greeting">
              {" "}
              <a href="https://three0dev.com/">
                Made with <span style={{ color: "purple" }}>three0</span>
              </a>
            </p>
            <div className="sidebar__headerRight">
              <IconButton>
                <DonutLargeIcon />
              </IconButton>
              <IconButton>
                <ChatIcon />
              </IconButton>
              <IconButton>
                <div onClick={exitApp}>
                  <ExitToAppIcon />
                </div>
              </IconButton>
            </div>
          </div>
          <div className="sidebar__search">
            <div className="sidebar__searchContainer">
              <SearchOutlined />
              <input
                placeholder="Search or Start a new chat"
                value={input}
                type="text"
                onChange={handleChange}
              />
            </div>
          </div>
          {sidebarBool ? (
            <div className="sidebar__chats scrollbar-juicy-peach">
              <SidebarChat addNewChatVal="true" />
              {rooms.length == 0 ? (
                <Loader />
              ) : (
                rooms.map((room) => (
                  <SidebarChat
                    key={room.id}
                    id={room.id}
                    name={room.data.name}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="sidebar__chats ">
              <SidebarChat addNewChatVal="true" />
              {search.map((room) => (
                <SidebarChat key={room.id} id={room.id} name={room.data.name} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Sidebar;
