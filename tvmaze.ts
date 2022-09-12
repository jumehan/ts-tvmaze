import axios from "axios";
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("episodesList");

const API_URL = "https://api.tvmaze.com/";
const ALT_IMG = "https://tinyurl.com/tv-missing";

interface showInterface {
  id: number;
  name: string;
  summary: string;
  image: string;
}

interface episodeInterface {
  id: number;
  name: string;
  season: number;
  number: number;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string ): Promise<showInterface[]> {
  const results = await axios.get(`${API_URL}search/shows`, { params: { q: term } });
  let shows = results.data.map((s: {
    show: {
      id: number,
      name: string,
      summary: string,
      image: { medium: string | undefined; };
    };
  }) => {
    return (
      {
        id: s.show.id,
        name: s.show.name,
        summary: s.show.summary,
        image: s.show.image ? s.show.image.medium : ALT_IMG,
      }
    );
  });
  return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: showInterface[]) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay(): Promise<void> {
  const term = $("#searchForm-term").val();

  if (typeof term === "string") {
    const shows = await getShowsByTerm(term);

    $episodesArea.hide();
    populateShows(shows);
  }
}

$searchForm.on("submit", async function (evt: JQuery.SubmitEvent) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id : number): Promise<episodeInterface[]>{
  const results = await axios.get(`${API_URL}shows/${id}/episodes`);
  console.log("EP results: ", results.data)
  let episodes = results.data.map((e: episodeInterface) => {
    return (
      {
        id: e.id,
        name: e.name,
        season: e.season,
        number: e.number,
      }
    );
  });

  return episodes;
 }

/**
 * Given list of episodes, create markup for each and add to DOM
 */

function populateEpisodes(episodes: episodeInterface[]) {

  for(let episode of episodes){
    const $episodeInfo = $(`<li> ${episode.name}
    Season: ${episode.season}, Number: ${episode.number} </li>`);

    $episodesArea.append($episodeInfo);
  }

  $episodesArea.show();
}

$("#showsList").on("click", "button", showEpisodeList);

/**
 * Event handler for episodes button and
 * populates list of episodes
 */
async function showEpisodeList(event : JQuery.ClickEvent): Promise<void>{
  $episodesList.empty();

  const showId = $(event.target).closest(".Show").data("show-id");

  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
  $episodesArea.show();
}
