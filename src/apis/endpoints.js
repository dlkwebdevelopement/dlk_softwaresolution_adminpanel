// 🔐 Auth
export const ADMIN_LOGIN = "/admin/login";

// 🧭 Categories
export const ADMIN_CREATE_CATEGORY = "/admin/category";
export const ADMIN_GET_CATEGORIES = "/admin/categories";
export const ADMIN_UPDATE_CATEGORY = (id) => `/admin/category/${id}`;
export const ADMIN_DELETE_CATEGORY = (id) => `/admin/category/${id}`;

// 🧩 Subcategories
export const ADMIN_CREATE_SUBCATEGORY = "/admin/subcategory";
export const ADMIN_GET_SUBCATEGORIES = "/admin/subcategories";
export const ADMIN_UPDATE_SUBCATEGORY = (id) => `/admin/subcategory/${id}`;
export const ADMIN_DELETE_SUBCATEGORY = (id) => `/admin/subcategory/${id}`;

// 📩 Enquiries
export const ADMIN_GET_ENQUIRIES = "/admin/enquiries";
export const ADMIN_MARK_ENQUIRY_READ = (id) => `/admin/enquiries/${id}/read`;
export const ADMIN_REPLY_ENQUIRY = "/admin/enquiries/reply";
export const ADMIN_DELETE_ENQUIRY = (id) => `/admin/enquiries/${id}`;

// 🖼️ Banners
// Make sure these are correctly defined
export const ADMIN_GET_BANNERS = "/admin/banners";
export const ADMIN_UPLOAD_BANNER = "/admin/upload-banner";
export const ADMIN_UPDATE_BANNER = (id) => `/admin/banner/${id}`;
export const ADMIN_DELETE_BANNER = (id) => `/admin/banner/${id}`;
export const ADMIN_TOGGLE_BANNER = (id) => `/admin/banner/${id}/toggle`;
export const ADMIN_TOGGLE_BANNER_CONTENT = (id) => `/admin/banner-op/${id}/toggle-visibility`;

// 💰 Offers
export const ADMIN_UPLOAD_OFFER = "/admin/offers";
export const ADMIN_GET_OFFERS = "/admin/offers";
export const ADMIN_UPDATE_OFFER = (id) => `/admin/offers/${id}`;
export const ADMIN_DELETE_OFFER = (id) => `/admin/offers/${id}`;

// 🏢 Company Images
export const ADMIN_UPLOAD_COMPANY = "/admin/upload-company";
export const ADMIN_DELETE_COMPANY = (id) => `/admin/company/${id}`;
export const ADMIN_GET_COMPANIES = "/admin/companies";

// ❓ FAQ (Questions & Answers)
export const ADMIN_ADD_QUESTION = "/admin/faq/question";
export const ADMIN_ADD_ANSWER = "/admin/faq/answer";
export const ADMIN_GET_ALL_QUESTIONS = "/admin/faq/questions";
export const ADMIN_UPDATE_QUESTION = (id) => `/admin/faq/question/${id}`;
export const ADMIN_DELETE_QUESTION = (id) => `/admin/faq/question/${id}`;
export const ADMIN_UPDATE_ANSWER = (id) => `/admin/faq/answer/${id}`;
export const ADMIN_DELETE_ANSWER = (id) => `/admin/faq/answer/${id}`;

// 📋 Register
export const ADMIN_GET_REGISTER = "/admin/register";
export const ADMIN_MARK_REGISTER_READ = (id) => `/admin/register/${id}/read`;
export const ADMIN_REPLY_REGISTER = "/admin/register/reply";
export const ADMIN_DELETE_REGISTER = (id) => `/admin/register/${id}`;

// 🎓 Live Classes
export const ADMIN_GET_LIVE_CLASSES = "/admin/liveclass";
export const ADMIN_POST_LIVE_CLASSES = "/admin/liveclass";
export const ADMIN_GET_LIVE_CLASSES_ID = (id) => `/admin/liveclass/${id}`;
export const ADMIN_UPDATE_LIVE_CLASSES = (id) => `/admin/liveclass/${id}`;
export const ADMIN_DELETE_LIVE_CLASSES = (id) => `/admin/liveclass/${id}`;

// 📝 Blogs
export const ADMIN_GET_ALL_BLOGS = "/admin/blogs";
export const ADMIN_POST_BLOGS = "/admin/blogs";
export const ADMIN_GET_BLOGS_SLUG = (slug) => `/admin/blogs/${slug}`;
export const ADMIN_UPDATE_BLOGS = (id) => `/admin/blogs/${id}`;
export const ADMIN_DELETE_BLOGS = (id) => `/admin/blogs/${id}`;

// 🎒 Student Projects
export const ADMIN_GET_ALL_STUDENT_PROJECTS = "/admin/student-projects";
export const ADMIN_POST_STUDENT_PROJECTS = "/admin/student-projects";
export const ADMIN_GET_STUDENT_PROJECTS_SLUG = (slug) => `/admin/student-projects/${slug}`;
export const ADMIN_UPDATE_STUDENT_PROJECTS = (id) => `/admin/student-projects/${id}`;
export const ADMIN_DELETE_STUDENT_PROJECTS = (id) => `/admin/student-projects/${id}`;

// 📚 Courses
export const ADMIN_POST_COURSES = "/admin/course";
export const ADMIN_GET_ALL_COURSES = "/admin/course";
export const ADMIN_GET_COURSE_SLUG = (slug) => `/admin/course/${slug}`;
export const ADMIN_UPDATE_COURSE = (id) => `/admin/course/${id}`;
export const ADMIN_DELETE_COURSE = (id) => `/admin/course/${id}`;

// 📞 Contact
export const ADMIN_GET_ALL_CONTACTS = "/admin/contact";
export const ADMIN_DELETE_CONTACTS = (id) => `/admin/contact/${id}`;
export const ADMIN_MARK_CONTACT_READ = (id) => `/admin/contact/${id}/read`;
export const ADMIN_REPLY_CONTACT = "/admin/contact/reply";

// 🌟 Testimonials
export const ADMIN_POST_TESTIMONIALS = "/admin/testimonial";
export const ADMIN_GET_ALL_TESIMONIALS = "/admin/testimonial";
export const ADMIN_UPDATE_TESTIMONIALS = (id) => `/admin/testimonial/${id}`;
export const ADMIN_DELETE_TESTIMONIALS = (id) => `/admin/testimonial/${id}`;

// 🖼️ Gallery
export const ADMIN_GET_GALLERY = "/admin/gallery";
export const ADMIN_CREATE_GALLERY = "/admin/gallery";
export const ADMIN_UPDATE_GALLERY = (id) => `/admin/gallery/${id}`;
export const ADMIN_DELETE_GALLERY = (id) => `/admin/gallery/${id}`;
export const ADMIN_ADD_GALLERY_IMAGES = (id) => `/admin/gallery/${id}/images`;
export const ADMIN_DELETE_GALLERY_IMAGE = (id) => `/admin/gallery/${id}/image`;

// 📅 Gallery Events
export const ADMIN_GET_ALL_GALLERY_EVENTS = "/admin/gallery-events";
export const ADMIN_POST_GALLERY_EVENT = "/admin/gallery-events";
export const ADMIN_PUT_GALLERY_EVENT = (id) => `/admin/gallery-events/${id}`;
export const ADMIN_DELETE_GALLERY_EVENT = (id) => `/admin/gallery-events/${id}`;

// 🎥 Videos
export const ADMIN_GET_VIDEOS = "/admin/videos";
export const ADMIN_POST_VIDEOS = "/admin/videos";
export const ADMIN_UPDATE_VIDEOS = (id) => `/admin/videos/${id}`;
export const ADMIN_DELETE_VIDEOS = (id) => `/admin/videos/${id}`;

// 🏆 Skills
export const ADMIN_GET_SKILLS = "/admin/skills";
export const ADMIN_POST_SKILLS = "/admin/skills";
export const ADMIN_UPDATE_SKILLS = (id) => `/admin/skills/${id}`;
export const ADMIN_DELETE_SKILLS = (id) => `/admin/skills/${id}`;

// 🎓 Placements
export const ADMIN_GET_PLACEMENTS = "/admin/placements";
export const ADMIN_UPLOAD_PLACEMENT = "/admin/placements";
export const ADMIN_UPDATE_PLACEMENT = (id) => `/admin/placements/${id}`;
export const ADMIN_DELETE_PLACEMENT = (id) => `/admin/placements/${id}`;
export const ADMIN_TOGGLE_PLACEMENT_ACTIVE = (id) => `/admin/placements/${id}/toggle`;
export const ADMIN_REORDER_PLACEMENTS = "/admin/placements/reorder";

// 📅 Workshops
export const ADMIN_GET_WORKSHOPS = "/admin/workshops";
export const ADMIN_POST_WORKSHOP = "/admin/workshops";
export const ADMIN_UPDATE_WORKSHOP = (id) => `/admin/workshops/${id}`;
export const ADMIN_DELETE_WORKSHOP = (id) => `/admin/workshops/${id}`;

// 🖼️ Office Gallery
export const ADMIN_GET_OFFICE_GALLERY = "/admin/office-gallery";
export const ADMIN_CREATE_OFFICE_GALLERY = "/admin/office-gallery";
export const ADMIN_UPDATE_OFFICE_GALLERY = (id) => `/admin/office-gallery/${id}`;
export const ADMIN_DELETE_OFFICE_GALLERY = (id) => `/admin/office-gallery/${id}`;
export const ADMIN_ADD_OFFICE_GALLERY_IMAGES = (id) => `/admin/office-gallery/${id}/images`;
export const ADMIN_DELETE_OFFICE_GALLERY_IMAGE = (id) => `/admin/office-gallery/${id}/image`;

// 📅 Office Gallery Events
export const ADMIN_GET_ALL_OFFICE_GALLERY_EVENTS = "/admin/office-gallery-events";
export const ADMIN_POST_OFFICE_GALLERY_EVENT = "/admin/office-gallery-events";
export const ADMIN_PUT_OFFICE_GALLERY_EVENT = (id) => `/admin/office-gallery-event/${id}`;
export const ADMIN_DELETE_OFFICE_GALLERY_EVENT = (id) => `/admin/office-gallery-event/${id}`;