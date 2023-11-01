import React      from 'react';
import Layout     from '@components/Layout';
import siteMap    from './menuData';
import Login      from './Login';
import { Switch, Route, useHistory } from 'react-router-dom';

import '../app/AddStyle.css';
import {addTab} from '@components/Layout/TabHeader';
import Dashboard from './Dashboard';
import { useLocation } from 'react-router-dom/cjs/react-router-dom';

// menuData.js에서 siteMap으로 Router 구성
// path, comp key로 구성된 Object 쌓는 Array 선언
let menuDataArr = []
siteMap.forEach(item => {
  (item.link && item.component) && 
    menuDataArr.push({
      // 경로
      path : item.link, 
      // component
      component : item.component,
      // key
      type : item.key
    })
})

const Pages = () => {
  const history = useHistory()
  const location = useLocation()
  React.useEffect(() => {
    addTab(location.pathname)
    // console.log("is dive")
    const unlisten = history.listen((location, action) => {
      addTab(location.pathname)
    })
    return unlisten;
  }, []);

  ////// Route in Route!!!!
  return (
    <Layout>
      <Switch>
        <Route
          path="/Login"
          component={Login}
          exact
        />
        {menuDataArr.map((routeData, index) => (
          <Route
            key={index}
            path={routeData.path}
            component={() => React.cloneElement(routeData.component, {...routeData})}
            exact
          />
        ))}
        <Route path="*" component= { Dashboard } />
      </Switch>
    </Layout>
  )
}

export default Pages
