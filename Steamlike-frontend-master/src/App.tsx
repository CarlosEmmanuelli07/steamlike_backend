import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Library from "./pages/Library";
import LibraryNew from "./pages/LibraryNew";
import LibraryDetail from "./pages/LibraryDetail";
import CatalogSearch from "./pages/CatalogSearch";
import ChangePassword from "./pages/ChangePassword";
import DeleteAccount from "./pages/DeleteAccount";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        {/* Auth — UA6 semana 2 */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

        {/* Biblioteca — UA6 semanas 1 y 2 */}
        <Route path="/library" element={<Library />} />
        <Route path="/library/new" element={<LibraryNew />} />
        <Route path="/library/:id" element={<LibraryDetail />} />

        {/* Catálogo CheapShark — UA7 semana 3 */}
        <Route path="/catalog/search" element={<CatalogSearch />} />

        {/* Perfil — UA7 semana 4 */}
        <Route path="/profile/password" element={<ChangePassword />} />
        <Route path="/profile/delete" element={<DeleteAccount />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
