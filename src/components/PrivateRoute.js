import { Redirect, Route } from "react-router-dom";

const PrivateRoute = ({ children, ...routeProps }) => {
  const profile = false;

  if (!profile) {
    return <Redirect to="/sigin" />;
  }

  return <Route {...routeProps}>{children}</Route>;
};

export default PrivateRoute;
