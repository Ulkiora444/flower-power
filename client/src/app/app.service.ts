import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AppService{

  protocol: string = 'http://';
  ip: string = 'localhost';
  port: string = '3000';

  url: string = this.protocol+this.ip+':'+this.port+'/'

  private token: string = this.getCookie('token');
  routerUser: number | undefined;

  constructor(private http: HttpClient, private router: Router){
    // this.getRouterUser();
  }

  rest(){
    window.location.reload()
  }

  private getCookie(name: string) {
    let ca: Array<string> = document.cookie.split(';');
    let caLen: number = ca.length;
    let cookieName = `${name}=`;
    let c: string;

    for (let i: number = 0; i < caLen; i += 1) {
        c = ca[i].replace(/^\s+/g, '');
        if (c.indexOf(cookieName) == 0) {
            return c.substring(cookieName.length, c.length);
        }
    }
    return '';
  }

  private setCookie(name: string, value: string, expireDays: number, path: string = '') {
    let d:Date = new Date();
    d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
    let expires:string = `expires=${d.toUTCString()}`;
    let cpath:string = path ? `; path=${path}` : '';
    document.cookie = `${name}=${value}; ${expires}${cpath}`;
  }
  // ---------------------------------------------------------------------------------------------------------

  getIndexLocalization(){
    if(this.getCookie('indexLocalization') == ''){
      this.setIndexLocalization(0);
      return 0;
    }
    return Number(this.getCookie('indexLocalization'));
  }

  setIndexLocalization(index: number){
    this.setCookie('indexLocalization', index.toString(), 1);
    this.routerUser = Number(index.toString());
  }

  // ---------------------------------------------------------------------------------------------------------

  getUserNavRouter(){
    if(this.getCookie('userNavRouter') == ''){
      this.setUserNavRouter(0);
      return 0;
    }
    return Number(this.getCookie('userNavRouter'));
  }

  setUserNavRouter(index: number){
    this.setCookie('userNavRouter', index.toString(), 1);
    this.routerUser = Number(index.toString());
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ---------------------------------------------------------------------------------------------------------

  getAdminNavRouter(){
    if(this.getCookie('adminNavRouter') == ''){
      this.setAdminNavRouter(0);
      return 0;
    }
    return Number(this.getCookie('adminNavRouter'));
  }

  setAdminNavRouter(index: number){
    this.setCookie('adminNavRouter', index.toString(), 1, '/admin');
  }

  // ---------------------------------------------------------------------------------------------------------

  isAdminLoggedIn(){
    return this.getCookie('adminAuth') == 'true';
  }

  loginAdmin(username: string, password: string){
    const isValid = username.trim() == 'admin' && password == 'admin';

    if(isValid){
      this.setCookie('adminAuth', 'true', 1, '/');
    }

    return isValid;
  }

  logoutAdmin(){
    this.setCookie('adminAuth', '', -1, '/');
    this.setCookie('adminNavRouter', '', -1, '/admin');
    this.router.navigate(['/home']);
  }

  // ---------------------------------------------------------------------------------------------------------

  getUserNewsId(){
    if(this.getCookie('userNewsId') == ''){
      this.setUserNewsId(-1);
      return -1;
    }
    return Number(this.getCookie('userNewsId'));
  }

  setUserNewsId(index: number){
    this.setCookie('userNewsId', index.toString(), 1);
  }

  // ---------------------------------------------------------------------------------------------------------

  getTarrifs(){
    let header = new HttpHeaders();
    return this.http.get(this.url+`api/tarrifs`, {
      headers: header.set('Authentication', this.token)
    });
  }

  getTarrifsId(id: number){
    let header = new HttpHeaders();
    return this.http.get(this.url+`api/tarrifs/${id}`, {
      headers: header.set('Authentication', this.token)
    });
  }

  postTarrifs(obj: any){
    let header = new HttpHeaders();
    return this.http.post(this.url+`api/tarrifs`, obj, {
      headers: header.set('Authentication', this.token)
    });
  }

  putTarrifs(obj: any){
    let header = new HttpHeaders();
    return this.http.put(this.url+`api/tarrifs`, obj, {
      headers: header.set('Authentication', this.token)
    });
  }

  deleteTarrifs(id: number){
    let header = new HttpHeaders();
    return this.http.delete(this.url+`api/tarrifs/${id}`, {
      headers: header.set('Authentication', this.token)
    });
  }     

    // ---------------------------------------------------------------------------------------------------------

  getOrganizations(){
    let header = new HttpHeaders();
    return this.http.get(this.url+`api/organizations`, {
      headers: header.set('Authentication', this.token)
    });
  }

  getOrganizationsId(id: number){
    let header = new HttpHeaders();
    return this.http.get(this.url+`api/organizations/${id}`, {
      headers: header.set('Authentication', this.token)
    });
  }

  postOrganizations(obj: any){
    let header = new HttpHeaders();
    return this.http.post(this.url+`api/organizations`, obj, {
      headers: header.set('Authentication', this.token)
    });
  }

  putOrganizations(obj: any){
    let header = new HttpHeaders();
    return this.http.put(this.url+`api/organizations`, obj, {
      headers: header.set('Authentication', this.token)
    });
  }

  deleteOrganizations(id: number){
    let header = new HttpHeaders();
    return this.http.delete(this.url+`api/organizations/${id}`, {
      headers: header.set('Authentication', this.token)
    });
  }           
 
    // ---------------------------------------------------------------------------------------------------------

  getInternetCafe(){
    let header = new HttpHeaders();
    return this.http.get(this.url+`api/internet_cafe`, {
      headers: header.set('Authentication', this.token)
    });
  }

  getInternetCafeId(id: number){
    let header = new HttpHeaders();
    return this.http.get(this.url+`api/internet_cafe/${id}`, {
      headers: header.set('Authentication', this.token)
    });
  }

  postInternetCafe(obj: any){
    let header = new HttpHeaders();
    return this.http.post(this.url+`api/internet_cafe`, obj, {
      headers: header.set('Authentication', this.token)
    });
  }

  putInternetCafe(obj: any){
    let header = new HttpHeaders();
    return this.http.put(this.url+`api/internet_cafe`, obj, {
      headers: header.set('Authentication', this.token)
    });
  }

  deleteInternetCafe(id: number){
    let header = new HttpHeaders();
    return this.http.delete(this.url+`api/internet_cafe/${id}`, {
      headers: header.set('Authentication', this.token)
    });
  }          

 // ---------------------------------------------------------------------------------------------------------

  getContacts(){
    let header = new HttpHeaders();
    return this.http.get(this.url+`api/contacts`, {
      headers: header.set('Authentication', this.token)
    });
  }

  getContactsId(id: number){
    let header = new HttpHeaders();
    return this.http.get(this.url+`api/contacts/${id}`, {
      headers: header.set('Authentication', this.token)
    });
  }

  postContacts(obj: any){
    let header = new HttpHeaders();
    return this.http.post(this.url+`api/contacts`, obj, {
      headers: header.set('Authentication', this.token)
    });
  }

  putContacts(obj: any){
    let header = new HttpHeaders();
    return this.http.put(this.url+`api/contacts`, obj, {
      headers: header.set('Authentication', this.token)
    });
  }

  deleteContacts(id: number){
    let header = new HttpHeaders();
    return this.http.delete(this.url+`api/contacts/${id}`, {
      headers: header.set('Authentication', this.token)
    });
  } 
  
 // ---------------------------------------------------------------------------------------------------------

  getNews(){
    let header = new HttpHeaders();
    return this.http.get(this.url+`api/news`, {
      headers: header.set('Authentication', this.token)
    });
  }

  getNewsId(id: number){
    let header = new HttpHeaders();
    return this.http.get(this.url+`api/news/${id}`, {
      headers: header.set('Authentication', this.token)
    });
  }

  postNews(obj: any){
    let header = new HttpHeaders();
    return this.http.post(this.url+`api/news`, obj, {
      headers: header.set('Authentication', this.token)
    });
  }

  putNews(obj: any){
    let header = new HttpHeaders();
    return this.http.put(this.url+`api/news`, obj, {
      headers: header.set('Authentication', this.token)
    });
  }

  deleteNews(id: number){
    let header = new HttpHeaders();
    return this.http.delete(this.url+`api/news/${id}`, {
      headers: header.set('Authentication', this.token)
    });
  } 
}
