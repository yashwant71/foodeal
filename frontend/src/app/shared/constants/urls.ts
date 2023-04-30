import { environment } from "src/environments/environment";

const BASE_URL = environment.production? '' : 'http://localhost:5000';

export const FOODS_URL = BASE_URL + '/api/foods';
export const FOODS_TAGS_URL = FOODS_URL + '/tags';
export const FOODS_BY_SEARCH_URL = FOODS_URL + '/search/';
export const FOODS_BY_TAG_URL = FOODS_URL + '/tag/';
export const FOOD_BY_ID_URL = FOODS_URL + '/';


export const USER_LOGIN_URL = BASE_URL + '/api/users/login';
export const USER_LOGINGOOGLE_URL = BASE_URL + '/api/users/loginwithgoogle';
export const USER_REGISTER_URL = BASE_URL + '/api/users/register';
export const USER_UPDATE_URL = BASE_URL + '/api/users/update';
export const USER_UPLOADIMG_URL = BASE_URL + '/api/users/uploadUserImage';
export const USER_GETIMG = BASE_URL + '/api/users/getUserImage';

export const FOOD_FAVORITE_URL = BASE_URL + '/api/users/favFood'

export const ORDERS_URL = BASE_URL + '/api/orders';
export const ORDER_CREATE_URL = ORDERS_URL + '/create';
export const ORDERS_GET = ORDERS_URL + '/getOrders';
export const ORDER_NEW_FOR_CURRENT_USER_URL = ORDERS_URL + '/newOrderForCurrentUser';
export const ORDER_PAY_URL = ORDERS_URL + '/pay';
export const ORDER_TRACK_URL = ORDERS_URL + '/track/';


export const CART_URL = BASE_URL + '/api/cart';
export const CART_UPDATE_URL = CART_URL + '/updateCart'
export const CART_ADD_URL = CART_URL + '/addItem'
export const CART_REMOVE_URL = CART_URL + '/removeItem'
export const CART_CLEAR_URL = CART_URL + '/clear'
