function onOpen() {
  createMenu();
}

function sidebarPage() {
  const htmlForSidebar = HtmlService.createTemplateFromFile("sidebar");
  const htmlOutput = htmlForSidebar.evaluate();
  const ui = SpreadsheetApp.getUi();
  ui.showModalDialog(htmlOutput, "Crear Clases en Classroom")
}

function createMenu() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu("Classrooms")
  menu.addItem("Cargar", "getCourses");
  menu.addItem("Enviar", "sidebarPage");
  menu.addItem("Nueva clase desde hoja",)
  menu.addToUi();
}

function getCourses() {
  let data = Classroom.Courses.list().courses;
  const ssData = data.map(c => {
    return [c.creationTime, c.updateTime, c.id, c.name, c.description, c.ownerId, c.section, c.courseState, c.enrollmentCode, c.alternateLink];
  });
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ws = ss.getSheetByName("Google Classroom");
  ws.getRange(2, 1, ssData.length, ssData[0].length).setValues(ssData);
}




function createClassrooms() {
  // 1. get courses from spreadsheet
  const courses = getCoursesFromSpreadsheet();
  Logger.log(courses);
  // 2. create courses on the classroom
  const responses = courses.map(course => {
    const resources = createCourseResource(course);
    const response = Classroom.Courses.create(resources);
    course[6] = response.alternateLink;
    course[7] = response.enrollmentCode;
    return course;
  });
  // 3. write the course url and share code the spreadsheet
  writeCoursesToSpreadsheet(responses);
  return true
}

function writeCoursesToSpreadsheet(courses) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName('Nuevos cursos');
  const range = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());
  // set new values
  range.setValues(courses);
  return true;
}


function getCoursesFromSpreadsheet() {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName('Nuevos cursos');
  const data = sheet.getDataRange().getValues();
  data.shift();
  return data.filter(row => row !== null);
}

function createCourseResource(course) {
  const [courseName, instructorName, instructorEmail, level] = course;
  const resource = Classroom.newCourse();
  resource.name = courseName;
  resource.ownerId = instructorEmail;
  resource.description = instructorName;
  resource.section = level;
  return resource;

}