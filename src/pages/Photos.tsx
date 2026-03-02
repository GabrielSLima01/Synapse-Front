import { Navigate } from 'react-router-dom';

// Agora a página de fotos redireciona diretamente para fotos públicas
export default function Photos() {
  return <Navigate to="/public-photos" replace />;
}
