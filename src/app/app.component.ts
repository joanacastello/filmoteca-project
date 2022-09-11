import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, fromEvent } from "rxjs";
import { debounceTime, map, distinctUntilChanged, filter} from "rxjs/operators";

const APIKEY = "ADD HERE YOUR API KEY";

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
  directors:string='';
  actors:string='';
  year:string='';

  constructor(private elementRef: ElementRef, private httpClient: HttpClient) {
    this.apiResponse = [];
    this.movieDetails = [];
    this.directors = '';
    this.actors = '';
    this.year= '';
  }

  ngOnInit() {
      fromEvent(this.movieInput.nativeElement, 'keyup').pipe( 

        map((event: any) => {
          return event.target.value;
        })
        , filter(res => res.length > 2)
        , debounceTime(1000)
        , distinctUntilChanged()

      ).subscribe((text: string) => {
        this.searchGetCall(text).subscribe((res) => {
          this.apiResponse = res;
        });
      });  

  }

  searchGetCall(term: string) {
    if (term === '') {
      return of([]);
    }
    //console.log('https://api.themoviedb.org/3/search/movie?api_key=' + APIKEY + "&query=" + term + "&language=es-ES");
    return this.httpClient.get('https://api.themoviedb.org/3/search/movie?api_key=' + APIKEY + "&query=" + term + "&language=es-ES");
  }

  
  // Smells baaaaad
  isShowDiv = true;

  getDetails(result: any){
    // Empty arrays to not stack info
    this.directors = '';
    this.actors = '';
    this.year = '';
    
    this.name = result.Title;
    this.isShowDiv = false;
    //console.log('https://api.themoviedb.org/3/movie/' + result.id + '?api_key=' + APIKEY + "&append_to_response=credits,videos" + "&language=es-ES")
    this.httpClient.get('https://api.themoviedb.org/3/movie/' + result.id + '?api_key=' + APIKEY + "&append_to_response=credits,videos" + "&language=es-ES")
      .subscribe(data=> {
        this.movieDetails=data;

        let dir = [];
        let act = [];
        for (var i = 0; i < this.movieDetails['credits']['crew'].length; i++) {
          if (this.movieDetails['credits']['crew'][i]['job'] == "Director"){
            dir.push(this.movieDetails['credits']['crew'][i]['name']);
          }
        }
        let j = 0;
        while (j < 4){
          act.push(this.movieDetails['credits']['cast'][j]['name'])
          j++;
        }
        this.directors = dir.toString();
        this.directors.replace(',',', ');
        this.actors = act.toString();
        this.actors.replace(',',', ');
        // Get year
        for (var k = 0; k < 4; k++){
          this.year += this.movieDetails['release_date'][k]
        }
    })
  }
}
