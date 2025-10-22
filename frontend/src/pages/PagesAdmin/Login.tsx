import "../../index.css";

export default function Login() {
  return (
    <div className="container">
      <h1>Connexion administrateur</h1>
      <form className="form">
        <label>Nom d'utilisateur</label>
        <input type="text" placeholder="admin@uqar.ca" />

        <label>Mot de passe</label>
        <input type="password" placeholder="••••••••" />

        <button className="btn-download">Se connecter</button>
      </form>
    </div>
  );
}
