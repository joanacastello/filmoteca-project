import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, fromEvent } from "rxjs";
import { debounceTime, map, distinctUntilChanged, filter} from "rxjs/operators";

const APIKEY1 = "f5ce28d0768ba39023be1785d9178b7c";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{
  title = 'filmoteca-project';
  
  @ViewChild('movieInput', {static: true})
  movieInput!: ElementRef;
  apiResponse: any;
  movieDetails: any;
  name:string='';
  director:string='';

  constructor(private elementRef: ElementRef, private httpClient: HttpClient) {
    this.apiResponse = [];
    this.movieDetails = [];

    console.log(this.movieInput);
  }

  ngOnInit() {
      console.log(this.movieInput);
      // event que es llança quan teclat (keyup)
      // gastem pipe per a encadenar diferents operadors junts
      fromEvent(this.movieInput.nativeElement, 'keyup').pipe( 

        // get value by mapping it
        map((event: any) => {
          return event.target.value;
        })
        // comprovem que s'han introduit mes de dos caracters
        , filter(res => res.length > 2)
        // refresca cada segon(?)
        , debounceTime(1000)
        // comprova que la query es diferent de la anterior
        , distinctUntilChanged()

      ).subscribe((text: string) => {
        this.searchGetCall(text).subscribe((res) => {
          console.log('res', res);
          this.apiResponse = res;
        }, (err) => {
          console.log('error', err);
        });
      });  

  }

  // Fa la petició HTTP despres de passar per tots els filtres
  searchGetCall(term: string) {
    if (term === '') {
      return of([]);
    }
    //console.log('https://api.themoviedb.org/3/search/movie?api_key=' + APIKEY1 + "&query=" + term + "&language=es-ES");
    return this.httpClient.get('https://api.themoviedb.org/3/search/movie?api_key=' + APIKEY1 + "&query=" + term + "&language=es-ES");
  }

  directors = '';
  actors = '';
  // Smells baaaaad
  indexes = new  Array();
  act = new Array();
  isShowDiv = true;

  getDetails(result: any){
    // Empty arrays to not stack info
    this.indexes = [];
    this.act= [];

    this.name= result.Title;
    this.isShowDiv = false;
    this.httpClient.get('https://api.themoviedb.org/3/movie/' + result.id + '?api_key=' + APIKEY1 + "&append_to_response=credits,videos" + "&language=es-ES")
      .subscribe(data=> {
        this.movieDetails=data;
    })
    // Get Directors and Actors
    for (var i = 0; i < this.movieDetails['credits']['crew'].length; i++) {
      if (this.movieDetails['credits']['crew'][i]['job'] == "Director"){
        this.indexes.push(this.movieDetails['credits']['crew'][i]['name']);
      }
    }
    let j = 0;
    while (j < 4){
      this.act.push(this.movieDetails['credits']['cast'][j]['name'])
      j++;
    }
    this.directors = this.indexes.toString();
    this.directors.replace(',',', ');
    this.actors = this.act.toString();
    this.actors.replace(',',', ');


  }
}
