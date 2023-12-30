// import httpMocks from 'node-mocks-http';
// import { createWeeklySurvey } from '../createWeeklySurvey';

// describe('createWeeklySurvey', () => {
//   it('sends a success response when createSurveyLogic succeeds', async () => {
//     // Arrange
//     const req = httpMocks.createRequest();
//     const res = httpMocks.createResponse();
//     res.status = jest.fn().mockReturnThis();
//     res.send = jest.fn();

//     // Mock the functions
//     const createSurveyLogicMock = jest.spyOn(createWeeklySurvey, 'createSurveyLogic');
//     const getTypeformConfigMock = jest.spyOn(createWeeklySurvey, 'getTypeformConfig');

//     createSurveyLogicMock.mockResolvedValue('fake-survey-url');
//     getTypeformConfigMock.mockReturnValue('fake-api-key');

//     // Act
//     await createWeeklySurvey(req, res);
  
//     // Assert
//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.send).toHaveBeenCalledWith('Survey created successfully');

//     // Restore the mocks after the test
//     createSurveyLogicMock.mockRestore();
//     getTypeformConfigMock.mockRestore();
//   });
// });