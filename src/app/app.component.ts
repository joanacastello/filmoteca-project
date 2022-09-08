import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of, fromEvent } from "rxjs";
import { debounceTime, map, distinctUntilChanged, filter} from "rxjs/operators";

const APIKEY1 = "f5ce28d0768ba39023be1785d9178b7c";
const APIKEY2 = "52c80efd";

const PARAMS = new HttpParams({
  fromObject: {
    action: "opensearch",
    format: "json",
    origin: "*"
  }
});

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{
  title = 'filmoteca-project';
  // 
  @ViewChild('movieInput', {static: true})
  movieInput!: ElementRef;
  apiResponse: any;
  movieDetails: any;
  name:string='';

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
    // console.log('http://www.omdbapi.com/?s=' + term + '&apikey=' + APIKEY2, { params: PARAMS.set('search', term) });
    return this.httpClient.get('http://www.omdbapi.com/?s=' + term + '&apikey=' + APIKEY2, { params: PARAMS.set('search', term) });
  }

  isShowDiv = true;
  getDetails(movie: any){
    this.name= movie.Title;
    this.isShowDiv = false;
    this.httpClient.get('http://www.omdbapi.com/?i=' + movie.imdbID + '&apikey=' + APIKEY2, { params: PARAMS.set('search', movie.imdbID) })
      .subscribe(data=> {
        this.movieDetails=data;
      })
  }
}
