import type { ChangeEvent, FC } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Buffer } from 'buffer';
import { fileTypeFromBuffer } from 'file-type/core';
import { getUserPhoto, putPhoto } from '../../../api/httpClient';
import { RoutePath } from '../../../router/RoutePath';

export const Sign: FC = () => {
  const user = sessionStorage.getItem('email') || localStorage.getItem('email');
  const userName =
    sessionStorage.getItem('userName') || localStorage.getItem('userName');
  const [userImage, setUserImage] = useState<string | null>();
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
  const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg'];

  useEffect(() => {
    getPhoto();
  }, []);

  const sendPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file: File = (e.target.files as FileList)[0];
    if (!file || !user) return null;

    // Client-side validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      alert('Invalid file type. Please upload a PNG or JPEG image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert('File size exceeds the 2MB limit.');
      return;
    }

    // Read the file as a buffer to validate its content
    const arrayBuffer = await file.arrayBuffer();
    const fileType = await fileTypeFromBuffer(new Uint8Array(arrayBuffer));

    if (!fileType || !ALLOWED_MIME_TYPES.includes(fileType.mime)) {
      alert('Invalid file content. Please upload a valid image.');
      return;
    }

    // Proceed with uploading the validated file
    putPhoto(file, user).then(() => getPhoto());
  };

  const getPhoto = () => {
    if (!user) return null;

    getUserPhoto(user).then((data) => {
      if (!(data instanceof ArrayBuffer)) {
        return null;
      }

      const base64 = Buffer.from(data).toString('base64');
      if (base64) {
        fileTypeFromBuffer(data).then((file_type) => {
          setUserImage(
            `data: ${file_type?.mime || 'image/svg+xml'}; base64, ${base64}`
          );
        });
      }
    });
  };

  const logout = () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.reload();
  };

  return (
    <>
      {user ? (
        <>
          <label htmlFor="file-input" className="file-input-label">
            <img
              src={userImage || 'assets/img/profile.png'}
              alt=""
              className="profile-image"
            />
          </label>
          <Link
            to={RoutePath.Home}
            className="get-started-btn scrollto"
            onClick={logout}
            role="button"
            aria-label="Log out"
          >
            Log out {userName}
          </Link>
          <input
            id="file-input"
            type="file"
            accept="image/png,image/jpeg"
            style={{ display: 'none' }}
            onChange={sendPhoto}
          />
        </>
      ) : (
        <>
          <a
            href={`${RoutePath.Login}?logobgcolor=transparent`}
            className="get-started-btn scrollto"
            role="button"
            aria-label="Sign in"
          >
            Sign in
          </a>
          <a
            href={RoutePath.LoginNew}
            className="get-started-btn scrollto"
            role="button"
            aria-label="2-step Sign in"
          >
            2-step Sign in
          </a>
        </>
      )}
    </>
  );
};

export default Sign;
