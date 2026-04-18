declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.sass" {
  const content: { [className: string]: string };
  export default content;
}

declare module "react-toastify/dist/ReactToastify.css";
declare module "nprogress/nprogress.css";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipGlobalLoading?: boolean;
  }

  export interface InternalAxiosRequestConfig {
    skipGlobalLoading?: boolean;
    __globalLoadingTracked?: boolean;
  }
}
