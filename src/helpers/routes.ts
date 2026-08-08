export const routes = {
  // general routes
  home: "/",
  login: "/login",
  register: "/register",
  // Public: reachable with no session, and deliberately outside both route
  // guards. `profile` below is the owner's own settings page - different thing.
  publicProfile: "/u/:username",
  // Public for the same reason: the version chip links here, and a version
  // number is worth nothing if you have to log in to read what it means.
  changelog: "/changelog",

  // authenticated routes
  profile: "/profile",
  myList: "/myList",
}
