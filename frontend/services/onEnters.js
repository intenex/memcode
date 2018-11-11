import store from '~/store';

const getCurrentUser = () => store.getState().global.Authentication.currentUser;

const requireAuthentication = (nextState, transition, callback) => {
  if (getCurrentUser()) {
    callback();
  } else {
    transition({ pathname: '/please-sign-in' });
  }
};

const redirectToOwnCoursesIfAuthenticated = (nextState, transition, callback) => {
  if (getCurrentUser()) {
    transition({ pathname: '/courses/learning' });
  } else {
    callback();
  }
};

const requireAdmin = (nextState, transition, callback) => {
  // introduce ifAdmin=true later
  if (getCurrentUser() && getCurrentUser().email === 'lakesare@gmail.com') {
    callback();
  } else {
    transition({ pathname: '/please-sign-in' });
  }
};

export default {
  requireAuthentication, redirectToOwnCoursesIfAuthenticated, requireAdmin
};