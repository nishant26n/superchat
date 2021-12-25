import React from "react";
import firebase from "firebase/compat/app";
import "./Signin.scss";
import {
  Container,
  Grid,
  Row,
  Col,
  Panel,
  Button,
  toaster,
  Notification,
} from "rsuite";
import { auth, database } from "../misc/firebase";

const Signin = () => {
  const signInWithProvider = async (provider) => {
    try {
      const { additionalUserInfo, user } = await auth.signInWithPopup(provider);

      if (additionalUserInfo.isNewUser) {
        await database.ref(`/profile/${user.uid}`).set({
          name: user.displayName,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
        });
      }

      toaster.push(
        <Notification type="success" header="success" duration={4500}>
          Welcome to SuperChat
        </Notification>,
        { placement: "topCenter" }
      );
    } catch (err) {
      toaster.push(
        <Notification type="error" header="error" duration={4500}>
          Error signing in
        </Notification>,
        { placement: "topCenter" }
      );
    }
  };

  const signInWithGoogle = () => {
    signInWithProvider(new firebase.auth.GoogleAuthProvider());
  };

  const signInWithGithub = () => {
    signInWithProvider(new firebase.auth.GithubAuthProvider());
  };

  return (
    <div className="sign-in">
      <div class="bg"></div>
      <div class="bg bg2"></div>
      <div class="bg bg3"></div>

      <Container>
        <Grid className="mt-page">
          <Row>
            <Col xs={24} md={12} mdOffset={6}>
              <Panel>
                <div className="text-center">
                  <h2>Welcome to SuperChat</h2>
                  <p>Progressive chat platform for neophytes</p>
                </div>

                <div className="mt-3">
                  <Button
                    block
                    color="green"
                    appearance="primary"
                    onClick={signInWithGoogle}
                  >
                    <i className="fab fa-google"></i> <br />
                    Continue with Google
                  </Button>

                  <Button
                    block
                    color="violet"
                    appearance="primary"
                    onClick={signInWithGithub}
                  >
                    <i className="fab fa-github"></i> <br />
                    Continue with Github
                  </Button>
                </div>
              </Panel>
            </Col>
          </Row>
        </Grid>
      </Container>
    </div>
  );
};

export default Signin;
