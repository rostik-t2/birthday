
export class AuthService {

  static getAuthInfo(): IAuthInfo {
    const authInfo = localStorage.getItem('authInfo');
    return authInfo ? JSON.parse(authInfo) : null;
  }

  static setAuthInfo(name, surname): void {
    localStorage.setItem('authInfo', JSON.stringify({name, surname}));
  }

  static clearAuthInfo(): void {
    localStorage.removeItem('authInfo');
  }

}

export interface IAuthInfo {
  name: string;
  surname: string;
}
