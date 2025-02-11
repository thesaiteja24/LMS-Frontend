import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from './App';
import { JobsProvider } from './contexts/JobsContext';
import { StudentsDataProvider } from './contexts/StudentsListContext';
import {StudentsManageProvider}  from './contexts/ManagerStudentsContext'
import { StudentsMentorProvider } from './contexts/MentorStudentsContext';
import { StudentsApplyProvider } from './contexts/StudentsApplyContext';
import { DashboardProvider } from "./contexts/DashboardContext";
import { EditProvider } from './contexts/EditContext';
import {StudentProvider} from './contexts/StudentProfileContext'
import { UniqueBatchesProvider } from './contexts/UniqueBatchesContext'
import { DailyProvider } from './contexts/DailyContext';



const theme = createTheme();

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <UniqueBatchesProvider>
        <JobsProvider> 
          <StudentsDataProvider>
            <StudentsManageProvider>
              <StudentsMentorProvider>
            <StudentsApplyProvider>
              <DashboardProvider>
                <StudentProvider>
                <EditProvider>
                  <DailyProvider>
            <App />
            </DailyProvider>
            </EditProvider>
            </StudentProvider>

            </DashboardProvider>
            
            </StudentsApplyProvider>
            </StudentsMentorProvider>
            </StudentsManageProvider>
          </StudentsDataProvider>
        </JobsProvider>
        </UniqueBatchesProvider>
      </ThemeProvider>
    </BrowserRouter>
);
