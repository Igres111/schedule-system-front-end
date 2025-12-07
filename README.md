# Scheduling System – Frontend

Frontend for a basic work scheduling system for employees.  
This application provides a simple UI for:

- User sign-up
- User login
- Viewing schedules
- Creating schedule requests

It is built with **React + TypeScript + Vite** and uses **React Router** for navigation. :contentReference[oaicite:0]{index=0}

---

## 🚀 Tech Stack

- **Framework:** React
- **Language:** TypeScript
- **Bundler:** Vite
- **Routing:** React Router (`react-router-dom`)
- **Styling:** CSS (via `index.css` and component-level styles)

---

## 📂 Project Structure

Main folders:

```text
src/
  App.tsx          # Application routes
  main.tsx        # React root + BrowserRouter
  components/
    SignupForm.tsx
    ...           # Reusable UI components
  pages/
    Login.tsx
    Schedules.tsx
    CreateSchedule.tsx
    ...           # Screen-level components
public/
  index.html
