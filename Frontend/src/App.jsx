const App = () => {
  return (
    <div>
      <form 
        action="http://localhost:5000/uploads" 
        method="POST" 
        enctype="multipart/form-data"
      >
        <input type="file" name="Doc_to_Pdf" />
        <button type="submit">Upload File</button>
      </form>
    </div>
  );
};

export default App;
