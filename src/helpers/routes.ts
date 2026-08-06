export const routes = {
  // general routes
  home: "/",
  login: "/login",
  register: "/register",
  // Public: reachable with no session, and deliberately outside both route
  // guards. `profile` below is the owner's own settings page - different thing.
  publicProfile: "/u/:username",

  // authenticated routes
  profile: "/profile",
  myList: "/myList",
}
