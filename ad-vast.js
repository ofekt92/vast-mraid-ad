var creatives;
var impressionUri;

document.addEventListener("DOMContentLoaded", () => {
  const { mraid } = window;
  mraid.addEventListener("ready", showAd);
  mraid.addEventListener("error", logError);

  loadVastDataJsonMock()
    .then((data) => {
      creatives = data.VAST.Ad.InLine.Creatives.Creative;
      impressionUri = data.VAST.Ad.InLine.Impression;
      mraid.fireReadyEvent();
    })
    .catch((err) => logError(err));
});

/**
 * Init function. Initializes the ad with the data received from xml (first func to run after receiving data).
 */
const showAd = () => {
  mraid.removeEventListener("ready", showAd);
  mraid.fireStateChangeEvent("default");

  const video = creatives[0].Linear.MediaFiles.MediaFile;
  mraid.playVideo(video);
  fireImpression();

  addEventListenersToVideo();
};

const addEventListenersToVideo = () => {
  const videoElement = document.getElementById("ad-video");
  videoElement.addEventListener("click", videoClickedHandler);
  videoElement.addEventListener("ended", videoEndedHandler);
};

const initCompanionAd = () => {
  const imageElem = document.getElementById("ad-image");
  imageElem.addEventListener("click", imageClickedHandler);
  imageElem.src = creatives[1].CompanionAds.Companion.StaticResource;

  imageElem.style.opacity = 1;
  imageElem.style.zIndex = 1;
  delete imageElem.style.height;
};

const videoClickedHandler = () => {
  document.getElementById("ad-video").pause();
  const { ClickTracking, ClickThrough } = creatives[0].Linear.VideoClicks;
  adClickedHandler(ClickTracking, ClickThrough);
};

const imageClickedHandler = () => {
  const { CompanionClickThrough, CompanionClickTracking } = creatives[1].CompanionAds.Companion;
  adClickedHandler(CompanionClickTracking, CompanionClickThrough);
};

const videoEndedHandler = () => {
  document.getElementById("ad-video").classList.add("fadeOut");
  initCompanionAd();
};

const fireImpression = () => {
  fetch(impressionUri)
    .then(console.log("Impression fired"))
    .catch((err) => logError(err));
};

/**
 * Tracks an ad-click and then opens a URI according to arguments.
 * @param {String} trackingUri Uri for tracking clicks.
 * @param {String} ClickThroughUri Uri to open upon clicking on ad.
 */
const adClickedHandler = (trackingUri, ClickThroughUri) => {
  try {
    if (trackingUri) {
      fetch(trackingUri, { method: "POST", headers: { "Content-Type": "application/json" }, })
        .then(console.log("Successfuly tracked click."))
        .catch((err) => logError(err));
    }
    if (ClickThroughUri) {
      mraid.open(ClickThroughUri);
    }
  } catch (error) {
    logError(error);
  }
};

/**
 * In real life I'd use a logger and some real error handling.
 * @param {String} msg Message to log
 */
const logError = (msg) => console.log(msg);

// I had issues parsing the XML correctly (used a 3rd party library that returned empty json objects instead of URLs.)
// so I created a mock-function that immitates this procedure (see loadVastDataJsonMock below)
// I left this func as a complementary so you could see what I was aiming for.
//
// *******************************************************************
const loadVastDataJson = async () => {
  const vastDataResponse = await fetch("https://run.mocky.io/v3/a7923657-00d8-4ca8-beb1-e56dcda7079d", 
  { headers: { "Content-Type": "application/xml" } }
  );
  if (!vastDataResponse.ok) {
    throw new Error("Failed to get VAST ad data.");
  }
  const vastDataString = await vastDataResponse.text();
  const vastDataJsXml = new window.DOMParser().parseFromString(vastDataString, "text/xml");
  const vastDataJson = xml2json(vastDataJsXml); // <--- 3rd party library that failed to deliver

  return vastDataJson;
};

// As previously stated, I ran into parsing issues whilst using a 3rd party library that was supposed to parse the xml for me.
// unforuntately, it didn't quite work, so I decided I would immitate the procedure by adding an 'async' operation to
// fetch the data and parse it (thus the setTimeout and the promise).
// Nevertheless, I left the original function above so you could see what I was aiming for. (see loadVastDataJson)
const loadVastDataJsonMock = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        VAST: {
          Ad: {
            InLine: {
              AdTitle: " Instagram ",
              Impression:
                " https://run.mocky.io/v3/a3e3e55d-242e-46f4-842a-291052fa580e ",

              Creatives: {
                Creative: [
                  {
                    Linear: {
                      Duration: "00:00:23",
                      VideoClicks: {
                        ClickThrough:
                          " https://play.google.com/store/apps/details?id=com.huuuge.casino.texas&hl=en&gl=US ",

                        ClickTracking:
                          " https://run.mocky.io/v3/5d3e7225-11d5-4c8a-9da4-d73e59dfa4c8 ",
                      },
                      MediaFiles: {
                        MediaFile:
                          " https://static.ssacdn.com/creatives/irv-biliionare_casino-port-rgl_10038/irv-biliionare_casino-port-rgl/assets/billionaire_v2.mp4 ",
                      },
                    },
                  },
                  {
                    CompanionAds: {
                      Companion: {
                        StaticResource:
                          " https://cdn6.aptoide.com/imgs/8/c/5/8c532df77a3e1073f0c5cdd2197efc38_screen.png?h=500 ",

                        CompanionClickThrough:
                          " https://play.google.com/store/apps/details?id=com.huuuge.casino.texas&hl=en&gl=US ",

                        CompanionClickTracking:
                          " https://run.mocky.io/v3/d7d851d4-f294-4cb3-9297-47f63390aeb3 ",
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      });
    });
  }, 500);
};
