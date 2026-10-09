// CardPost menerima 'props' (title dan body) dari parent component
function CardPost({ title, body }) {
  return (
    <div 
      style={{ 
        border: '1px solid #444', 
        padding: '15px', 
        marginBottom: '10px', 
        borderRadius: '8px',
        textAlign: 'left'
      }}
    >
      <h3 style={{ textTransform: 'capitalize', marginTop: 0 }}>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

export default CardPost;