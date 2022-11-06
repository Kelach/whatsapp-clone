import React from "react";
import { Button } from "@material-ui/core";
import "./Login.css";
import { auth, provider } from "./firebase";
import { useStateValue } from "./StateProvider";
import { actionTypes } from "./reducer";
import { Auth } from '@three0dev/js-sdk';

function Login() {
  const [{}, dispatch] = useStateValue();
  const signIn = Auth.login;
  // const signIn = () => {
  //   auth
  //     .signInWithPopup(provider)
  //     .then((result) => {
  //       console.log(result.user);
  //       dispatch({
  //         type: actionTypes.SET_USER,
  //         user: result.user,
  //       });
  //       dispatch({
  //         type: actionTypes.SET_SESSION,
  //         uid: result.user.uid,
  //         displayName: result.user.displayName,
  //         photoURL: result.user.photoURL,
  //       });
  //     })
  //     .catch((err) => alert(err.message));
  // };

  return (
    <div className="login">
      <div className="login__container">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/225px-WhatsApp.svg.png"
          alt="whatsapp"
        />
        <div className="login__text">
          <h1>Sign in to Whatsapp</h1>
        </div>
        <Button onClick={signIn}>Sign In with Near</Button>
      </div>
    </div>
  );
}

export default Login;
