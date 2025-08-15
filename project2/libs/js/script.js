// Global 

  // Loading Spinner Component
  const LoadingSpinner = {
    show: function() {
      if (!document.getElementById('loading-spinner')) {
        const spinner = $(`
          <div id="loading-spinner" class="position-fixed top-50 start-50 translate-middle bg-white p-3 rounded shadow-lg" style="z-index: 9999">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        `);
        $('body').append(spinner);
      }
    },
    hide: function() {
      $('#loading-spinner').remove();
    }
  };
  
// Enhanced AJAX Handler
function enhancedAjax(options) {
  const defaultSettings = {
    beforeSend: function() {
      LoadingSpinner.show();
    },
    complete: function() {
      LoadingSpinner.hide();
    },
    error: function(xhr, status, error) {
      Notifications.show(`Error: ${error}. Please try again.`, 'danger');
    }
  };

  return $.ajax({ ...defaultSettings, ...options });
}



// Table Sorting
function makeTableSortable(tableId) {
  $(`#${tableId} th`).css('cursor', 'pointer').click(function() {
    const table = $(this).parents('table').eq(0);
    const rows = table.find('tr:gt(0)').toArray().sort(comparer($(this).index()));
    this.asc = !this.asc;
    if (!this.asc) rows.reverse();
    for (let i = 0; i < rows.length; i++) {
      table.append(rows[i]);
    }
  });
}

function comparer(index) {
  return function(a, b) {
    const valA = getCellValue(a, index);
    const valB = getCellValue(b, index);
    return $.isNumeric(valA) && $.isNumeric(valB) ?
      valA - valB : valA.localeCompare(valB);
  };
}

function getCellValue(row, index) {
  return $(row).children('td').eq(index).text();
}



//----------------------------------------------------
// Global variable to track current active tab/table
let currentActiveTable = 'personnel'; // default to personnel


// Global refresh functions

function refreshPersonnelTable(department = "", location = "", action = "") {
  enhancedAjax({
    url: "libs/php/getFilteredPersonnel.php",
    type: "GET",
    dataType: "json",
    data: { department, location },
    success: function(result) {
      if (result.status.code == 200) {
        updatePersonnelTable(result.data);
        resetSearch();
      }
    }
  });
}

function refreshDepartmentTable(action = "") {
  $.ajax({
    url: "libs/php/getAllDepartmentsWithLocations.php",
    type: "GET",
    dataType: "json",
    success: function(result) {
      if (result.status.code == 200) {
        updateDepartmentTable(result.data);
        resetSearch(); // Add reset search after table update
      } 
    },
    error: function(jqXHR, textStatus, errorThrown) {
      Notifications.show("Error loading departments: " + textStatus, "danger");
    }
  });
}

function refreshLocationTable(action = "") {
  $.ajax({
    url: "libs/php/getAllLocations.php",
    type: "GET",
    dataType: "json",
    success: function(result) {
      if (result.status.code == 200) {
        updateLocationTable(result.data);
        resetSearch(); // Add reset search after table update
      }
    }
  });
}

// Event listener for tab changes
$('button[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
  let target = $(e.target).attr("data-bs-target");
  switch(target) {
    case "#personnel-tab-pane":
      refreshPersonnelTable();
      break;
    case "#departments-tab-pane":
      refreshDepartmentTable();
      break;
    case "#locations-tab-pane":
      refreshLocationTable();
      break;
  }
});


// Function to clear search and reset table visibility

function resetSearch() {
  $("#searchInp").val(''); // Clear search input
  $(`#${currentActiveTable}TableBody tr`).show(); // Show all rows in current table
}

$('#personnelTab, #departmentTab, #locationTab').on('click', function() {
  // Update current active table based on clicked tab
  currentActiveTable = $(this).attr('id').replace('Tab', '').toLowerCase();
  
  // Reset search when switching tabs
  resetSearch();
  
  // Your existing tab switching code here
  // ...
});

$('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
  var target = $(e.target).attr("href") // activated tab
  refreshTable(target);
});

function refreshTable(tabId) {
  // Clear the search input
  $('#searchInp').val('');

  // Refresh the specific table based on the tab
  switch(tabId) {
    case '#personnel':
      refreshPersonnelTable();
      break;
    case '#department':
      refreshDepartmentTable();
      break;
    case '#location':
      refreshLocationTable();
      break;
  }
}



// Global update table functions
function updatePersonnelTable(data) {
  let tableContent = "";
  data.forEach(person => {
    tableContent += `
      <tr>
        <td class="align-middle text-nowrap">${person.lastName}, ${person.firstName}</td>
        <td class="align-middle text-nowrap d-none d-md-table-cell">${person.department}</td>
        <td class="align-middle text-nowrap d-none d-md-table-cell">${person.location}</td>
        <td class="align-middle text-nowrap d-none d-md-table-cell">${person.jobTitle}</td>
        <td class="align-middle text-nowrap d-none d-md-table-cell">${person.email}</td>
        <td class="text-end text-nowrap">
          <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${person.id}">
            <i class="fa-solid fa-pencil fa-fw"></i>
          </button>
          <button type="button" class="btn btn-primary btn-sm" onclick="deletePersonnel(${person.id})">
            <i class="fa-solid fa-trash fa-fw"></i>
          </button>
        </td>
      </tr>
    `;
  });
  $("#personnelTableBody").html(tableContent);
}

function updateDepartmentTable(data) {
  let tableContent = "";
  data.forEach(dept => {
    tableContent += `
      <tr>
        <td class="align-middle text-nowrap">${dept.name}</td>
        <td class="align-middle text-nowrap d-none d-md-table-cell">${dept.location}</td>
        <td class="text-end text-nowrap">
          <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${dept.id}">
            <i class="fa-solid fa-pencil fa-fw"></i>
          </button>
          <button type="button" class="btn btn-primary btn-sm" onclick="deleteDepartment(${dept.id})">
            <i class="fa-solid fa-trash fa-fw"></i>
          </button>
        </td>
      </tr>
    `;
  });
  $("#departmentTableBody").html(tableContent);
}

function updateLocationTable(data) {
  let tableContent = "";
  data.forEach(loc => {
    tableContent += `
      <tr>
        <td class="align-middle text-nowrap">${loc.name}</td>
        <td class="text-end text-nowrap">
          <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-id="${loc.id}">
            <i class="fa-solid fa-pencil fa-fw"></i>
          </button>
          <button type="button" class="btn btn-primary btn-sm" onclick="deleteLocation(${loc.id})">
            <i class="fa-solid fa-trash fa-fw"></i>
          </button>
        </td>
      </tr>
    `;
  });
  $("#locationTableBody").html(tableContent);
}


//Delete Functions

function getDeleteErrorMessage(itemName, linkedItemType, linkedItemCount) {
  const pluralForm = linkedItemCount === 1 
    ? linkedItemType 
    : `${linkedItemType}s`;
  
  return `You cannot remove the entry for ${itemName} because it has ${linkedItemCount} ${pluralForm} assigned to it.`;
}

// Personnel deletion handlers
function deletePersonnel(id) {
  // Get personnel details before showing modal
  $.ajax({
    url: "libs/php/getPersonnelByID.php",
    type: "POST",
    dataType: "json",
    data: { id: id },
    success: function(result) {
      if (result.status.code == 200) {
        const personnel = result.data.personnel[0];
        $("#deletePersonnelID").val(id);
        $("#deletePersonnelName").text(`${personnel.firstName} ${personnel.lastName}`);
        $("#deletePersonnelModal").modal("show");
      } else {
        Notifications.show("Error retrieving personnel details", "danger");
      }
    },
    error: function(xhr, status, error) {
      Notifications.show("Error: " + error, "danger");
    }
  });
}

// Department deletion handlers
function deleteDepartment(id) {
  $.ajax({
    url: "libs/php/checkDepartmentUse.php",
    type: "POST",
    dataType: "json",
    data: { id: id },
    success: function(result) {
      if (result.status.code == 200) {
        const dept = result.data[0];
        
        if (dept.personnelCount > 0) {
          // Grammatically correct singular/plural handling
          const personText = dept.personnelCount === 1 ? "employee" : "employees";
          $("#cantDeleteDeptName").text(dept.departmentName);
          $("#personnelCount").text(`${dept.personnelCount} ${personText}`);
          $("#cantDeleteDepartmentModal").modal("show");
        } else {
          $("#deleteDepartmentID").val(id);
          $("#deleteDeptName").text(dept.departmentName);
          $("#deleteDeleteDepartmentModal").modal("show");
        }
      } else {
        Notifications.show("Error checking department usage", "danger");
      }
    },
    error: function(xhr, status, error) {
      Notifications.show("Error: " + error, "danger");
    }
  });
}

function deleteLocation(id) {
  $.ajax({
    url: "libs/php/checkLocationUse.php",
    type: "POST",
    dataType: "json",
    data: { id: id },
    success: function(result) {
      if (result.status.code == 200) {
        const location = result.data[0];
        if (location.departmentCount > 0) {
          // Grammatically correct singular/plural handling
          const departmentText = location.departmentCount === 1 ? "department" : "departments";
          $("#cantDeleteLocationName").text(location.locationName);
          $("#departmentCount").text(`${location.departmentCount} ${departmentText}`);
          $("#cantDeleteLocationModal").modal("show");
        } else {
          $("#deleteLocationID").val(id);
          $("#deleteLocationName").text(location.locationName);
          $("#deleteLocationModal").modal("show");
        }
      } else {
        Notifications.show("Error checking location usage", "danger");
      }
    },
    error: function(xhr, status, error) {
      Notifications.show("Error: " + error, "danger");
    }
  });
}

// Form submission handlers
$("#deletePersonnelForm").on("submit", function(e) {
  e.preventDefault();
  const id = $("#deletePersonnelID").val();
  
  $.ajax({
    url: "libs/php/deletePersonnelByID.php",
    type: "POST",
    dataType: "json",
    data: { id: id },
    success: function(result) {
      if (result.status.code == 200) {
        $("#deletePersonnelModal").modal("hide");
        refreshPersonnelTable("", "", "delete");
        Notifications.show("Employee deleted successfully", "success");
      } else {
        Notifications.show("Error deleting employee: " + result.status.description, "danger");
      }
    },
    error: function(xhr, status, error) {
      Notifications.show("Error: " + error, "danger");
    }
  });
});

$("#deleteDepartmentForm").on("submit", function(e) {
  e.preventDefault();
  const id = $("#deleteDepartmentID").val();
  
  $.ajax({
    url: "libs/php/deleteDepartmentByID.php",
    type: "POST",
    dataType: "json",
    data: { id: id },
    success: function(result) {
      if (result.status.code == 200) {
        $("#deleteDeleteDepartmentModal").modal("hide");
        refreshDepartmentTable("delete");
        Notifications.show("Department deleted successfully", "success");
      } else {
        Notifications.show("Error deleting department: " + result.status.description, "danger");
      }
    },
    error: function(xhr, status, error) {
      Notifications.show("Error: " + error, "danger");
    }
  });
});

// Location deletion form submission handler
$("#deleteLocationForm").on("submit", function(e) {
    e.preventDefault();
    const id = $("#deleteLocationID").val();
    $.ajax({
        url: "libs/php/deleteLocationByID.php",
        type: "POST",
        dataType: "json",
        data: { id: id },
        success: function(result) {
            if (result.status.code == 200) {
                $("#deleteLocationModal").modal("hide");
                refreshLocationTable("delete");
                Notifications.show("Location deleted successfully", "success");
            } else {
                Notifications.show("Error deleting location: " + result.status.description, "danger");
            }
        },
        error: function(xhr, status, error) {
            Notifications.show("Error: " + error, "danger");
        }
    });
});

//-----------------------------------------------------------
// Document ready function

$(document).ready(function() {

  
  // Initial function calls to populate tables
  refreshPersonnelTable();
  refreshDepartmentTable();
  refreshLocationTable();

  populateDepartmentDropdown();
  // populateLocationDropdown();

    // Make tables sortable
    makeTableSortable('personnelTableBody');
    makeTableSortable('departmentTableBody');
    makeTableSortable('locationTableBody');

    $('#filterPersonnelModal').on('show.bs.modal', function () {
      initializeFilterDropdowns();
    });

$("#addPersonnelModal").on("show.bs.modal", function() {
  populateAddEmployeeDepartmentDropdown();
});

  // Search functionality
  $("#searchInp").on("keyup", function() {
    let searchText = $(this).val().toLowerCase();
    let activeTab = $(".tab-pane.active").attr("id");
    let targetTableBody;
  
    switch (activeTab) {
      case "personnel-tab-pane":
        targetTableBody = "#personnelTableBody";
        break;
      case "departments-tab-pane":
        targetTableBody = "#departmentTableBody";
        break;
      case "locations-tab-pane":
        targetTableBody = "#locationTableBody";
        break;
      default:
        return;
    }
  
    $(`${targetTableBody} tr`).filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(searchText) > -1);
    });
  });
  


  // Refresh button click handler
  $("#refreshBtn").click(function() {
    if ($("#personnelBtn").hasClass("active")) {
      refreshPersonnelTable("", "", "refresh");
    } else if ($("#departmentsBtn").hasClass("active")) {
      refreshDepartmentTable("refresh");
    } else {
      refreshLocationTable("refresh");
    }
  });

  // Filter functionality
  $("#filterPersonnelByDepartment").change(function () {
  
    if (this.value > 0) {
      
      $("#filterPersonnelByLocation").val(0);
      
      // apply Filter
      refreshPersonnelTable(this.value, 0);
        
    }
})

$("#filterPersonnelByLocation").change(function () {
  
    if (this.value > 0) {
      
      $("#filterPersonnelByDepartment").val(0);
      
      // apply Filter
      refreshPersonnelTable(0, this.value);
    }
})

// $("#filterPersonnelByDepartment, #filterPersonnelByLocation").change(function() {
//   const departmentId = $("#filterPersonnelByDepartment").val();
//   const locationId = $("#filterPersonnelByLocation").val();
  
//   // Only refresh if a filter is selected
//   if (departmentId > 0 || locationId > 0) {
//     refreshPersonnelTable(departmentId, locationId);
//   } else {
//     refreshPersonnelTable(); // Reset to all
//   }
// });
  // Filter form submission


  // Add button handler
  $("#addBtn").click(function() {
    if ($("#personnelBtn").hasClass("active")) {
      populateDepartmentDropdown("#addPersonnelDepartment");
      $("#addPersonnelModal").modal("show");
    } else if ($("#departmentsBtn").hasClass("active")) {
      populateLocationDropdown("#addDepartmentLocation");
      $("#addDepartmentModal").modal("show");
    } else {
      $("#addLocationModal").modal("show");
    }
  });

  // Form submissions
  $("#addPersonnelForm").on("submit", function(e) {
    e.preventDefault();
    enhancedAjax({
      url: "libs/php/insertPersonnel.php",
      type: "POST",
      dataType: "json",
      data: $(this).serialize(),
      success: function(result) {
        if (result.status.code == 200) {
          $("#addPersonnelModal").modal("hide");
          refreshPersonnelTable("", "", "add");
        }
      }
    });
  });



  $("#editPersonnelForm").on("submit", function(e) {
    e.preventDefault();
    const data = {
      id: $("#editPersonnelEmployeeID").val(),
      firstName: $("#editPersonnelFirstName").val(),
      lastName: $("#editPersonnelLastName").val(),
      jobTitle: $("#editPersonnelJobTitle").val(),
      email: $("#editPersonnelEmailAddress").val(),
      departmentID: $("#editPersonnelDepartment").val()
    };
  
    $.ajax({
      url: "libs/php/updatePersonnel.php",
      type: "POST",
      dataType: "json",
      data: data,
      success: function(result) {
        if (result.status.code == 200) {
          $("#editPersonnelModal").modal("hide");
          refreshPersonnelTable("", "", "update");
        } else {
          Notifications.show("Error updating employee: " + result.status.description, "danger");
        }
      },
      error: function(xhr, status, error) {
        Notifications.show("Error updating employee: " + error, "danger");
      }
    });
  });

  // Edit Personnel Modal Handler
  $("#editPersonnelModal").on("show.bs.modal", function(e) {
    const id = $(e.relatedTarget).data("id");
    $.ajax({
      url: "libs/php/getPersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: { id },
      success: function(result) {
        if (result.status.code == 200) {
          const personnel = result.data.personnel[0];
          $("#editPersonnelEmployeeID").val(personnel.id);
          $("#editPersonnelFirstName").val(personnel.firstName);
          $("#editPersonnelLastName").val(personnel.lastName);
          $("#editPersonnelEmailAddress").val(personnel.email);
          $("#editPersonnelJobTitle").val(personnel.jobTitle);
          
          // Populate departments dropdown
          $("#editPersonnelDepartment").html("");
          $.each(result.data.department, function() {
            $("#editPersonnelDepartment").append($("<option>", {
              value: this.id,
              text: this.name
            }));
          });
          $("#editPersonnelDepartment").val(personnel.departmentID);
        }
      }
    });
  });

  // Form reset functions
function resetAddPersonnelForm() {
  $("#addPersonnelForm")[0].reset();
  $("#addPersonnelDepartment").html("");
}

function resetAddDepartmentForm() {
  $("#addDepartmentForm")[0].reset();
  $("#addDepartmentLocation").html("");
}

function resetAddLocationForm() {
  $("#addLocationForm")[0].reset();
}

// Modal handlers
$("#addPersonnelModal").on("hidden.bs.modal", function() {
  resetAddPersonnelForm();
});

$("#addDepartmentModal").on("hidden.bs.modal", function() {
  // populateLocationDropdown();
  resetAddDepartmentForm();
  
});

$("#addLocationModal").on("hidden.bs.modal", function() {
  resetAddLocationForm();
});

// Department form handlers
$("#addDepartmentForm").on("submit", function(e) {
  e.preventDefault();
  $.ajax({
    url: "libs/php/insertDepartment.php",
    type: "POST",
    dataType: "json",
    data: $(this).serialize(),
    success: function(result) {
      if (result.status.code == 200) {
        $("#addDepartmentModal").modal("hide");
        refreshDepartmentTable("add");
      }
    }
  });
});

$("#editDepartmentForm").on("submit", function(e) {
  e.preventDefault();
  const data = {
    id: $("#editDepartmentID").val(),
    name: $("#editDepartmentName").val(),
    locationID: $("#editDepartmentLocation").val()
  };

  $.ajax({
    url: "libs/php/updateDepartment.php",
    type: "POST",
    dataType: "json",
    data: data,
    success: function(result) {
      if (result.status.code == 200) {
        $("#editDepartmentModal").modal("hide");
        refreshDepartmentTable("update");
        
      }
    }
  });
});

// Location form handlers
$("#addLocationForm").on("submit", function(e) {
  e.preventDefault();
  $.ajax({
    url: "libs/php/insertLocation.php",
    type: "POST",
    dataType: "json",
    data: $(this).serialize(),
    success: function(result) {
      if (result.status.code == 200) {
        $("#addLocationModal").modal("hide");
        refreshLocationTable("add");
      }
    }
  });
});

$("#editLocationForm").on("submit", function(e) {
  e.preventDefault();
  const data = {
    id: $("#editLocationID").val(),
    name: $("#editLocationName").val()
  };

  $.ajax({
    url: "libs/php/updateLocation.php",
    type: "POST",
    dataType: "json",
    data: data,
    success: function(result) {
      if (result.status.code == 200) {
        $("#editLocationModal").modal("hide");
        refreshLocationTable("update");
      }
    }
  });
});

// Edit modal handlers
$("#editDepartmentModal").on("show.bs.modal", function(e) {
  const departmentId = $(e.relatedTarget).data("id");
  
  // First load all locations for the dropdown
  $.ajax({
    url: "libs/php/getAllLocations.php",
    type: "GET",
    dataType: "json",
    success: function(result) {
      if (result.status.code == 200) {
        $("#editDepartmentLocation").empty();
        result.data.forEach(location => {
          $("#editDepartmentLocation").append(
            $("<option>", {
              value: location.id,
              text: location.name
            })
          );
        });
        
        // Then load the department data
        $.ajax({
          url: "libs/php/getDepartmentByID.php",
          type: "POST",
          dataType: "json",
          data: { id: departmentId },
          success: function(result) {
            if (result.status.code == 200) {
              const department = result.data.department[0];
              $("#editDepartmentID").val(department.id);
              $("#editDepartmentName").val(department.name);
              $("#editDepartmentLocation").val(department.locationID);
            } else {
              alert("Error loading department data: " + result.status.description);
            }
          },
          error: function(jqXHR, textStatus, errorThrown) {
            alert("Error loading department data: " + textStatus);
          }
        });
      }
    }
  });
});

$("#editLocationModal").on("show.bs.modal", function(e) {
  const locationId = $(e.relatedTarget).data("id");
  
  $.ajax({
    url: "libs/php/getLocationByID.php",
    type: "POST",
    dataType: "json",
    data: { id: locationId },
    success: function(result) {
      if (result.status.code == 200) {
        const location = result.data[0];
        $("#editLocationID").val(location.id);
        $("#editLocationName").val(location.name);
      } else {
        alert("Error loading location data: " + result.status.description);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      alert("Error loading location data: " + textStatus);
    }
  });
});
});

// Helper functions
// Function to populate department dropdown for Add Employee modal
function populateAddEmployeeDepartmentDropdown() {
  $.ajax({
    url: "libs/php/getAllDepartmentsWithLocations.php",
    type: "GET",
    dataType: "json",
    success: function(result) {
      if (result.status.code == 200) {
        const dropdown = $("#addPersonnelDepartment");
        dropdown.empty(); // Clear existing options
        
        // Add placeholder option
        dropdown.append($("<option>", {
          value: "",
          text: "Select Department",
          disabled: true,
          selected: true
        }));
        
        // Add departments with their locations
        result.data.forEach(function(department) {
          dropdown.append($("<option>", {
            value: department.id,
            text: `${department.name}`
          }));
        });
      } else {
        console.error("Error fetching departments:", result.status.description);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("AJAX error:", textStatus, errorThrown);
    }
  });
}

// Update your existing populateDepartmentDropdown function to be more specific
function populateDepartmentDropdown(targetSelector = "#filterPersonnelByDepartment") {
  $.ajax({
    url: "libs/php/getAllDepartments.php",
    type: "GET",
    dataType: "json",
    success: function(result) {
      if (result.status.code == 200) {
        const dropdown = $(targetSelector);
        dropdown.empty();
        
        // Add "All" option for filter dropdown
        if (targetSelector === "#filterPersonnelByDepartment") {
          dropdown.append($("<option>", {
            value: "0",
            text: "All"
          }));
        }
        
        // Add departments
        result.data.forEach(function(department) {
          dropdown.append($("<option>", {
            value: department.id,
            text: department.name
          }));
        });
      }
    }
  });
}


function populateLocationDropdown(targetSelector = "#addDepartmentLocation") {
  $.ajax({
    url: "libs/php/getAllLocations.php",  // Changed to correct endpoint
    type: "GET",
    dataType: "json",
    success: function(result) {
      if (result.status.code == 200) {
        const dropdown = $(targetSelector);
        dropdown.empty(); // Clear existing options
        
        // Add default option if needed
        if (targetSelector === "#filterPersonnelByLocation") {
          dropdown.append($("<option>", {
            value: "0",
            text: "All"
          }));
        }
        
        // Add locations
        result.data.forEach(function(location) {
          dropdown.append($("<option>", {
            value: location.id,
            text: location.name
          }));
        });
      } else {
        console.error("Error fetching locations:", result.status.description);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("AJAX error:", textStatus, errorThrown);
    }
  });
}

// Populate department filter dropdown
function populateFilterDepartmentDropdown() {
  $.ajax({
    url: "libs/php/getAllDepartments.php",
    type: "GET",
    dataType: "json",
    success: function(result) {
      if (result.status.code == 200) {
        const dropdown = $("#filterPersonnelByDepartment");
        dropdown.empty(); // Clear existing options
        
        // Add default "All" option
        dropdown.append($("<option>", {
          value: "0",
          text: "All"
        }));
        
        // Add departments
        result.data.forEach(function(department) {
          dropdown.append($("<option>", {
            value: department.id,
            text: department.name
          }));
        });
      } else {
        console.error("Error fetching departments:", result.status.description);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("AJAX error:", textStatus, errorThrown);
    }
  });
}

// Populate location filter dropdown
function populateFilterLocationDropdown() {
  $.ajax({
    url: "libs/php/getAllLocations.php",
    type: "GET",
    dataType: "json",
    success: function(result) {
      if (result.status.code == 200) {
        const dropdown = $("#filterPersonnelByLocation");
        dropdown.empty(); // Clear existing options
        
        // Add default "All" option
        dropdown.append($("<option>", {
          value: "0",
          text: "All"
        }));
        
        // Add locations
        result.data.forEach(function(location) {
          dropdown.append($("<option>", {
            value: location.id,
            text: location.name
          }));
        });
      } else {
        console.error("Error fetching locations:", result.status.description);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("AJAX error:", textStatus, errorThrown);
    }
  });
}

// Function to initialize filter modal dropdowns
function initializeFilterDropdowns() {
  populateFilterDepartmentDropdown();
  populateFilterLocationDropdown();
}


$('#filterPersonnelModal').on('hidden.bs.modal', function () {
  resetFilterModal();
});

  
function resetFilterModal() {
  // Reset department select to 'All'
  $('#filterPersonnelByDepartment').val('0');
  
  // Reset location select to 'All'
  $('#filterPersonnelByLocation').val('0');
}


$('#filterBtn').on('click', function(e) {
  const activeTab = $('.tab-pane.active').attr('id');
  if (activeTab === 'personnel-tab-pane') {
    $('#filterPersonnelModal').modal('show');
  }
});

$('button[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
  const target = $(e.target).attr("data-bs-target");
  const filterBtn = $('#filterBtn');
  
  if (target === "#personnel-tab-pane") {
    filterBtn.prop('disabled', false);
  } else {
    filterBtn.prop('disabled', true);
  }
});

  //_________________________________________________
