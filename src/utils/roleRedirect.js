import { ROLES } from "../lib/constants";

export function getRoleBasedRedirect(role) {
  switch (role) {
    case ROLES.JOB_SEEKER:
      return "/";
    case ROLES.EMPLOYER:
      return "/employer/dashboard";
    case ROLES.ADMIN:
      return "/admin/dashboard";
    default:
      return "/login";
  }
}
