import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { User } from './user';
import * as  jsSHA from 'jssha';

declare var Config: any; //  this comes from the autogenerated config.js file
@Injectable()
export class UserService {
  private usersUrl = Config.frontend.url + '/api/v1/users' ;
  private headers = new Headers ({'Content-Type': 'application/json'});

  constructor (private http: Http) { }
  getUsers(): Promise<User[]> {
    return this.http.get(this.usersUrl)
      .toPromise()
      .then(function (response) {
        let users: User[] = [];
        for (let jsonUser of response.json()) {
          users[users.length] = {id: jsonUser.userID, alias: jsonUser.alias, email: jsonUser.email, password: jsonUser.password};
        }
        return users;
      })
      .catch(this.handleError);
  }

  create(newAlias: string, newEmail: string, newPassword: string): Promise<User> {
    const jsSHAObject:jsSHA.jsSHA = new jsSHA("SHA-256","TEXT");
    jsSHAObject.update(newPassword);
    let hashedPassword =  jsSHAObject.getHash ("HEX");
    let user: User = {id: null, alias: newAlias, email: newEmail, password:  hashedPassword};
    return this.http
      .put(this.usersUrl, JSON.stringify(user), {headers: this.headers})
      .toPromise()
      .then(function (response) {
          if (response.status === 201) {
            return user;
          } else {
            throw 'Error creating user ' + response.text;
          }
      })
      .catch(this.handleError);
  }

  delete(id: number): Promise<void> {
    const url = `${this.usersUrl}/${id}`;
    return this.http.delete(url, {headers: this.headers})
      .toPromise()
      .then(() => null)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
  getUser(id: number): Promise<User> {
      return this.getUsers()
      .then(users => users.find(user => user.id === id));
  }
  update(user: User, newPassword: string |undefined): Promise<User> {
    if ((user.password != newPassword) && newPassword!=undefined) {
       const jsSHAObject:jsSHA.jsSHA = new jsSHA("SHA-256","TEXT");
      jsSHAObject.update(newPassword);
      user.password =  jsSHAObject.getHash ("HEX");
    }
    const url = `${this.usersUrl}/${user.id}`;
    return this.http
      .post(url, JSON.stringify(user), {headers: this.headers})
      .toPromise()
      .then(() => user)
      .catch(this.handleError);
  }

}
