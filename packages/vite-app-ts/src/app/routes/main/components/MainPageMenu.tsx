import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';

export interface IMainPageMenuProps {
  route: string;
  setRoute: React.Dispatch<React.SetStateAction<string>>;
}

export const MainPageMenu: FC<IMainPageMenuProps> = (props) => (
  <Menu
    style={{
      textAlign: 'center',
      display: 'block',
    }}
    selectedKeys={[props.route]}
    mode="horizontal">
    <Menu.Item key="/">
      <Link
        onClick={() => {
          props.setRoute('/');
        }}
        to="/">
        YourCollectible UI
      </Link>
    </Menu.Item>
    <Menu.Item key="/debug">
      <Link
        onClick={() => {
          props.setRoute('/debug');
        }}
        to="/debug">
        Debug
      </Link>
    </Menu.Item>
    <Menu.Item key="/hints">
      <Link
        onClick={() => {
          props.setRoute('/hints');
        }}
        to="/hints">
        Hints
      </Link>
    </Menu.Item>
  </Menu>
);
