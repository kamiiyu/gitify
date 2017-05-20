import React from 'react'; // eslint-disable-line no-unused-vars
import { MemoryRouter } from 'react-router-dom';
import { fromJS, Map } from 'immutable';
import { mount } from 'enzyme';
import { List } from 'immutable';

const { shell, ipcRenderer } = require('electron');

import { Sidebar, mapStateToProps } from '../../components/sidebar';
import { mockedEnterpriseAccounts, mockedNotificationsRecuderData } from '../../__mocks__/mockedData';

describe('components/Sidebar.js', () => {

  let clock;
  const props = {
    isFetching: false,
    isGitHubLoggedIn: true,
    isEitherLoggedIn: true,
    connectedAccounts: 2,
    enterpriseAccounts: mockedEnterpriseAccounts,
    notifications: mockedNotificationsRecuderData,
    hasStarred: false,
    fetchNotifications: jest.fn(),
    toggleSettingsModal: jest.fn(),
  };

  const notifications = fromJS([{ id: 1 }, { id: 2 }]);

  beforeEach(() => {
    clock = jest.useFakeTimers();
    ipcRenderer.send.mockReset();
    shell.openExternal.mockReset();
    window.clearInterval.mockReset();

    props.fetchNotifications.mockReset();
    props.toggleSettingsModal.mockReset();
  });

  afterEach(() => {
    clock.clearAllTimers();
  });

  it('should test the mapStateToProps method', () => {
    const state = {
      auth: Map({
        token: '12345',
        enterpriseAccounts: mockedEnterpriseAccounts
      }),
      notifications: Map({
        response: List(),
      }),
      settings: Map({
        hasStarred: true
      }),
    };

    const mappedProps = mapStateToProps(state);

    expect(mappedProps.isGitHubLoggedIn).toBeTruthy();
    expect(mappedProps.isEitherLoggedIn).toBeTruthy();
    expect(mappedProps.notifications).toBeDefined();
    expect(mappedProps.hasStarred).toBeTruthy();
  });

  it('should render itself & its children (logged in)', () => {
    spyOn(Sidebar.prototype, 'componentDidMount').and.callThrough();

    const wrapper = mount(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    );

    expect(wrapper).toBeDefined();
    expect(Sidebar.prototype.componentDidMount).toHaveBeenCalledTimes(1);
    expect(wrapper.find('.fa-refresh').length).toBe(1);
    expect(wrapper.find('.fa-cog').length).toBe(1);
    expect(wrapper.find('.badge-primary').first().text()).toBe(`GitHub ${notifications.size}`);
    expect(wrapper.find('.badge-primary').last().text()).toBe(`gitify ${notifications.size}`);
  });

  it('should clear the interval when unmounting', () => {
    spyOn(Sidebar.prototype, 'componentDidMount').and.callThrough();

    const wrapper = mount(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    );

    expect(wrapper).toBeDefined();
    expect(Sidebar.prototype.componentDidMount).toHaveBeenCalledTimes(1);

    wrapper.unmount();
    expect(window.clearInterval).toHaveBeenCalledTimes(1);
  });

  it('should load notifications after 60000ms', function () {
    const wrapper = mount(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    );

    expect(wrapper).toBeDefined();

    clock.runTimersToTime(60000);
    expect(props.fetchNotifications).toHaveBeenCalledTimes(1);
  });

  it('should render itself & its children (logged out)', function () {
    const caseProps = {
      ...props,
      notifications: List(),
      isGitHubLoggedIn: false,
      isEitherLoggedIn: false,
    };

    spyOn(Sidebar.prototype, 'componentDidMount').and.callThrough();

    const wrapper = mount(
      <MemoryRouter>
        <Sidebar {...caseProps} />
      </MemoryRouter>
    );

    expect(wrapper).toBeDefined();
    expect(Sidebar.prototype.componentDidMount).toHaveBeenCalledTimes(1);
    expect(wrapper.find('.fa-refresh').length).toBe(0);
    expect(wrapper.find('.fa-cog').length).toBe(0);
    expect(wrapper.find('.tag-success').length).toBe(0);
  });

  it('should open the gitify repo in browser', () => {
    const wrapper = mount(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    );

    expect(wrapper).toBeDefined();

    wrapper.find('.logo').simulate('click');

    expect(shell.openExternal).toHaveBeenCalledTimes(1);
    expect(shell.openExternal).toHaveBeenCalledWith('https://www.github.com/manosim/gitify');
  });

  it('should toggle the settings modal', () => {
    const wrapper = mount(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    );

    expect(wrapper).toBeDefined();
    expect(wrapper.find('.fa-cog').length).toBe(1);

    wrapper.find('.fa-cog').simulate('click');

    expect(props.toggleSettingsModal).toHaveBeenCalledTimes(1);
  });

  it('should refresh the notifications', () => {
    const wrapper = mount(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    );

    expect(wrapper).toBeDefined();
    expect(wrapper.find('.fa-refresh').length).toBe(1);

    wrapper.find('.fa-refresh').simulate('click');
    expect(props.fetchNotifications).toHaveBeenCalledTimes(1);
  });

  it('open the gitify repo in browser', () => {
    const wrapper = mount(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    );

    expect(wrapper.find('.btn-star').length).toBe(1);

    wrapper.find('.btn-star').simulate('click');
    expect(shell.openExternal).toHaveBeenCalledTimes(1);
  });
});
