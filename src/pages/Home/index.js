import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { Col, Grid, Row } from "rsuite";
import Sidebar from "../../components/Sidebar";
import { RoomsProvider } from "../../context/rooms.context";
import { useMediaQuery } from "../../misc/custom-hook";
import Chat from "./Chat";

const Home = () => {
  const isDesktop = useMediaQuery("(min-width: 992px)");
  const { isExact } = useRouteMatch();

  const canRenderSidebar = isDesktop || isExact;

  return (
    <RoomsProvider>
      <Grid fluid className="h-100">
        <Row className="h-100">
          {canRenderSidebar && (
            <Col xs={24} md={8} className="h-100">
              <Sidebar />
            </Col>
          )}

          <Switch>
            <Route exact path="/chat/:chatId">
              <Col xs={24} md={16} className="h-100">
                <Chat />
              </Col>
            </Route>

            <Route>
              {isDesktop && (
                <Col xs={24} md={16} className="h-100">
                  <h3 className="text-center mt-page">Please select chat</h3>
                </Col>
              )}
            </Route>
          </Switch>
        </Row>
      </Grid>
    </RoomsProvider>
  );
};

export default Home;
