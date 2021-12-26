import "rsuite/dist/rsuite.min.css";
import "./styles/main.scss";
import "./styles/override.scss";
import "./styles/utility.scss";
import "./styles/utility_colors.scss";
import { BrowserRouter as Switch } from "react-router-dom";
import Signin from "./pages/Signin";
import Home from "./pages/Home";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import { ProfileProvider } from "./context/profile.context";

function App() {
  return (
    <ProfileProvider>
      <Switch>
        <PublicRoute path="/signin">{Signin}</PublicRoute>

        <PrivateRoute path="/">{Home}</PrivateRoute>
      </Switch>
    </ProfileProvider>
  );
}

export default App;
