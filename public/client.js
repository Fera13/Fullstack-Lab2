const myTable = document.getElementById("myTable");
const myTableBody = document.querySelector(".rows");
const isEmpty = (str) => !str.trim().length;
const errorSpace = document.querySelector(".error-space");

async function showAlbums() {
  try {
    const updateArea = document.querySelector(".update-space");
    updateArea.innerHTML = "";
    myTableBody.innerHTML = "";
    const oldRows = document.querySelectorAll("#myTable .rows tr");
    oldRows.forEach((row) => {
      row.remove();
    });
    await fetch(`http://localhost:3000/api/albums`, {
      method: "GET",
    })
      .then((response) => {
        return response.json();
      })
      .then((albums) => {
        for (const album of albums) {
          addAlbumRow(album);
        }
        myTable.appendChild(myTableBody);
      });
    myTable.addEventListener("click", (event) => {
      const rowId = event.target.closest("tr").id;
      if (event.target.classList.contains("delete-btn")) {
        handleDelete(rowId);
      } else if (event.target.classList.contains("update-btn")) {
        handleUpdate(rowId);
      } else if (event.target.classList.contains("show-details-btn")) {
        const titleText = event.target
          .closest("tr")
          .querySelector(".title-cell").textContent;
        handleShowingDetails(event, titleText);
      }
    });
  } catch (error) {
    console.log(error);
  }
}
showAlbums();

async function handleDelete(rowId) {
  try {
    errorSpace.innerHTML = "";
    const response = await fetch(`http://localhost:3000/api/albums/${rowId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (response.status === 404) {
      errorSpace.textContent = "Failed to delete. The album wasn't found.";
      return;
    }

    await showAlbums();

    errorSpace.textContent = "Album deleted successfully!";
  } catch (error) {
    console.error(error);
  }
}
async function handleUpdate(rowId) {
  errorSpace.innerHTML = "";
  const updateParent = document.querySelector(".update-space");
  updateParent.innerHTML = `
    <label>Updated title</label>
    <input type="text" id="up-titleText"></input>
    <label>Updated artist</label>
    <input type="text" id="up-artistText"></input>
    <label>Updated year</label>
    <input type="text" id="up-yearText"></input>
    <button id="update">Update the album</button>`;

  const updateButton = document.getElementById("update");
  const upTitleText = document.querySelector("#up-titleText");
  const upArtistText = document.querySelector("#up-artistText");
  const upYearText = document.querySelector("#up-yearText");
  updateButton.addEventListener("click", () => {
    if (
      isEmpty(upTitleText.value) ||
      isEmpty(upArtistText.value) ||
      isEmpty(upYearText.value)
    ) {
      errorSpace.textContent = "Please fill out all fields.";
      return;
    }
    doTheUpdate(rowId);
  });
}

async function doTheUpdate(rowId) {
  errorSpace.innerHTML = "";
  const newTitle = document.querySelector("#up-titleText").value;
  const newArtist = document.querySelector("#up-artistText").value;
  const newYear = document.querySelector("#up-yearText").value;
  try {
    const response = await fetch(`http://localhost:3000/api/albums/${rowId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        artist: newArtist,
        year: newYear,
      }),
    });

    if (response.status === 404) {
      errorSpace.textContent = "Failed to update. The album wasn't found.";
      return;
    }
    errorSpace.textContent = "Album updated successfully!";
    await showAlbums();
  } catch (error) {
    console.error(error);
  }
}

async function handleShowingDetails(event, title) {
  try {
    const response = await fetch(`http://localhost:3000/api/albums/${title}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
    const albums = Promise.resolve(result);

    albums
      .then((text) => {
        const row = event.target.closest("tr");
        const showDetails = row.querySelector(".show-details");
        showDetails.innerHTML = text
          .map(
            (album) =>
              `ID: ${album._id} Title: ${album.title}, Artist: ${album.artist}, Year: ${album.year}`
          )
          .join(" ");
      })
      .catch((err) => {
        console.log(err);
      });
    if (response.status === 404) {
      errorSpace.textContent =
        "Failed to show details. The album wasn't found.";
      return;
    }
  } catch (error) {
    console.error(error);
  }
}

const create = document.querySelector("#createAlbumBtn");
create.addEventListener("click", () => {
  const titleText = document.querySelector("#titleText");
  const artistText = document.querySelector("#artistText");
  const yearText = document.querySelector("#yearText");
  // Check if any input fields are empty
  if (
    isEmpty(titleText.value) ||
    isEmpty(artistText.value) ||
    isEmpty(yearText.value)
  ) {
    errorSpace.textContent = "Please fill out all fields.";
    return;
  }

  // Send a POST request to create a new album
  fetch("http://localhost:3000/api/albums", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: titleText.value,
      artist: artistText.value,
      year: yearText.value,
    }),
  })
    .then((response) => {
      console.log("Response:", response);
      return response.json();
    })
    .then((newAlbum) => {
      // Clear the input fields and error message
      titleText.value = "";
      artistText.value = "";
      yearText.value = "";
      errorSpace.textContent = "";

      // Add the new album to the table
      addAlbumRow(newAlbum);
    })
    .catch((error) => console.error("Error creating album:", error));
});

async function addAlbumRow(album) {
  const row = document.createElement("tr");
  row.setAttribute("id", album._id);
  const content = `
              <td class="title-cell">${album.title}</td>
              <td class="btn-cell">
                <button class="update-btn"> Update Album </button>
              </td>
              <td class="btn-cell">
                <button class="delete-btn"> Delete Album </button>
              </td>
              <td class="btn-cell">
                <button class="show-details-btn"> Show details </button>
              </td>
              <td class="show-details"></td>`;

  row.innerHTML = content;
  myTableBody.appendChild(row);
}
/*try {
  document.addEventListener("DOMContentLoaded", () => {
    // Select the necessary elements from the HTML
    const createAlbumBtn = document.querySelector("#createAlbumBtn");
    const titleText = document.querySelector("#titleText");
    const artistText = document.querySelector("#artistText");
    const yearText = document.querySelector("#yearText");
    const errorSpace = document.querySelector(".error-space");

    // Function to check if a string is empty
    const isEmpty = (str) => !str.trim().length;

    // Function to handle form submission
    const handleSubmit = () => {
      // Check if any input fields are empty
      if (
        isEmpty(titleText.value) ||
        isEmpty(artistText.value) ||
        isEmpty(yearText.value)
      ) {
        errorSpace.textContent = "Please fill out all fields.";
        return;
      }

      // Send a POST request to create a new album
      fetch("http://localhost:3000/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleText.value,
          artist: artistText.value,
          year: yearText.value,
        }),
      })
        .then((response) => {
          console.log("Response:", response);
          return response.json();
        })
        .then((newAlbum) => {
          // Clear the input fields and error message
          titleText.value = "";
          artistText.value = "";
          yearText.value = "";
          errorSpace.textContent = "";

          // Add the new album to the table
          addAlbumRow(newAlbum);
        })
        .catch((error) => console.error("Error creating album:", error));
    };*/
