import React, { lazy, Suspense } from "react";

import "rsuite/dist/rsuite.min.css";
import "./styles/main.scss";
import { Switch } from "react-router-dom";
import Home from "./pages/Home";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import { ProfileProvider } from "./context/profile.context";

const Signin = lazy(() => import("./pages/Signin"));

function App() {
  return (
    <ProfileProvider>
      <Switch>
        <PublicRoute path="/signin">
          <Suspense fallback={<div>Loading...</div>}>
            <Signin />
          </Suspense>
        </PublicRoute>
        <PrivateRoute path="/">
          <Home />
        </PrivateRoute>
      </Switch>
    </ProfileProvider>
  );
}

export default App;
