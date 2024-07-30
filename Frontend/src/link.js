const BackendLink = process.env.REACT_APP_PUBLIC_PATH || "http://localhost:5000"
const ImageCloud = process.env.REACT_APP_IMAGE_CLOUD || "http://localhost:5000/GetImage"
const SocketUrl = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000"

export { BackendLink, ImageCloud, SocketUrl }
