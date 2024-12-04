export const layout = (content: string) => ` 
<!DOCTYPE html>
<html>
  <head>
    <title>feral.pure---internet.com</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="feral.pure---internet.com">
    <meta name="author" content="Matthias Jordan">
    <meta name="robots" content="noindex, nofollow">
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body { 
        max-width: 800px;
        margin: 0;
        padding: 2rem;
        font-family: monospace;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      ul, ol {
        padding-left: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .card {
        padding: 1rem;
        border: 1px solid #eee;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .card-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        opacity: 0.7;
      }

      h2, h3 {
        margin-top: 0.5rem;
      }

      small {
        opacity: 0.7;
      }

      @media (max-width: 900px) {
        .grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 600px) {
        .grid {
          grid-template-columns: 1fr;
        }
        body {
          padding: 1rem;
        }
      }
    </style>
  </head>
  <body>${content}</body>
  <script>
    document.querySelectorAll('.timestamp').forEach(el => {
      el.textContent = new Date(parseInt(el.dataset.time)).toLocaleString();
    });
  </script>
</html>
`;
