import React, { lazy, Suspense } from "react";

import "rsuite/dist/rsuite.min.css";
import "./styles/main.scss";
import { Switch } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import { ProfileProvider } from "./context/profile.context";
import { PresenceProvider } from "./context/presence.context";
import { Container, Loader } from "rsuite";

// Both pages are lazy-loaded to reduce the initial JS bundle
const Signin = lazy(() => import("./pages/Signin"));
const Home = lazy(() => import("./pages/Home"));

const AppLoader = (
  <Container>
    <Loader center vertical size="md" content="Loading..." speed="slow" />
  </Container>
);

function App() {
  return (
    <ProfileProvider>
      <PresenceProvider>
        <Suspense fallback={AppLoader}>
          <Switch>
            <PublicRoute path="/signin">
              <Signin />
            </PublicRoute>
            <PrivateRoute path="/">
              <Home />
            </PrivateRoute>
          </Switch>
        </Suspense>
      </PresenceProvider>
    </ProfileProvider>
  );
}

export default App;
