import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { LangProvider } from "./lib/lang";
import { PrefsProvider } from "./lib/prefs";
import { AboutPage } from "./pages/AboutPage";
import { HomePage } from "./pages/HomePage";
import { QuizPage } from "./pages/QuizPage";
import { ResearchPage } from "./pages/ResearchPage";
import { SavedPage } from "./pages/SavedPage";
import { WordPage } from "./pages/WordPage";
import { WordsPage } from "./pages/WordsPage";

export default function App() {
  return (
    <LangProvider>
      <PrefsProvider>
        <HashRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="words" element={<WordsPage />} />
              <Route path="word/:id" element={<WordPage />} />
              <Route path="quiz" element={<QuizPage />} />
              <Route path="research" element={<ResearchPage />} />
              <Route path="stats" element={<Navigate to="/research" replace />} />
              <Route path="saved" element={<SavedPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </PrefsProvider>
    </LangProvider>
  );
}
