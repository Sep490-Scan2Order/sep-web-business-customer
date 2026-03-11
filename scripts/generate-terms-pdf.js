const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const outputDir = path.join(__dirname, "..", "public", "documents");
const outputFile = path.join(outputDir, "s2o-terms-and-policies.pdf");
const arialFontPath = "C:/Windows/Fonts/arial.ttf";
const logoPath = path.join(__dirname, "..", "src", "images", "logo", "logo_default.png");

const lines = [
  "ĐIỀU KHOẢN VÀ CHÍNH SÁCH SỬ DỤNG NỀN TẢNG S2O (SCAN2ORDER)",
  "Cập nhật lần cuối: 11/03/2026",
  "",
  "Tài liệu này quy định các điều khoản và chính sách khi sử dụng nền tảng S2O. Khi truy cập,",
  "đăng ký tài khoản hoặc sử dụng bất kỳ dịch vụ nào trên hệ thống, người dùng được xem là",
  "đã đọc, hiểu và đồng ý tuân thủ toàn bộ các điều khoản dưới đây.",
  "",
  "1. CHẤP NHẬN ĐIỀU KHOẢN",
  "Khi sử dụng nền tảng S2O, người dùng đồng ý tuân thủ toàn bộ các điều khoản, điều kiện",
  "và chính sách được quy định. Nếu không đồng ý, người dùng phải ngừng sử dụng ngay lập tức.",
  "S2O có quyền cập nhật các điều khoản theo từng thời điểm để phù hợp với quy định pháp luật.",
  "",
  "2. TÀI KHOẢN VÀ BẢO MẬT",
  "Người dùng phải cung cấp thông tin chính xác, đầy đủ và cập nhật khi có thay đổi. Người",
  "dùng chịu trách nhiệm: bảo mật thông tin đăng nhập; không chia sẻ tài khoản cho bên thứ ba;",
  "thông báo ngay khi phát hiện truy cập trái phép. S2O không chịu trách nhiệm với thiệt hại",
  "phát sinh từ việc không bảo mật thông tin tài khoản.",
  "",
  "3. QUYỀN VÀ NGHĨA VỤ SỬ DỤNG HỆ THỐNG",
  "Người dùng cam kết sử dụng đúng mục đích và tuân thủ pháp luật. Hành vi bị cấm: gian lận",
  "hoặc lừa đảo; phát tán mã độc; khai thác lỗi hệ thống; thu thập dữ liệu trái phép; hoạt động",
  "vi phạm pháp luật. S2O có quyền tạm khóa hoặc chấm dứt tài khoản nếu vi phạm.",
  "",
  "4. CHÍNH SÁCH THANH TOÁN",
  "S2O cung cấp các gói dịch vụ thuê bao theo chu kỳ. Khi nâng cấp lên gói cao hơn, thời gian",
  "còn lại của gói cũ sẽ cộng vào gói mới. Ví dụ: nâng cấp sau 1 tháng (còn 2 tháng), gói 3",
  "tháng mới = 5 tháng. Người dùng sẽ được sử dụng quyền lợi của gói cao hơn trong toàn thời",
  "gian này.",
  "",
  "5. CHÍNH SÁCH HOÀN TIỀN",
  "S2O là nền tảng trung gian. Trách nhiệm của nhà hàng: đảm bảo thông tin món ăn chính xác,",
  "cập nhật tình trạng món kịp thời, đảm bảo chất lượng. Nhà hàng phải hoàn tiền khi: món ăn",
  "bị hỏng/sai/hết nhưng hệ thống vẫn cho đặt; đơn hàng sai số lượng; không thể cung cấp sau",
  "nhận tiền. S2O hỗ trợ ghi nhận phản hồi nhưng không chịu trách nhiệm trực tiếp.",
  "",
  "6. QUYỀN RIÊNG TƯ VÀ DỮ LIỆU",
  "S2O cam kết bảo vệ dữ liệu theo nguyên tắc bảo mật. Hệ thống chỉ thu thập thông tin cần",
  "thiết cho xác thực, đơn hàng, quản lý dịch vụ và cải thiện trải nghiệm. Dữ liệu không chia",
  "sẻ cho bên thứ ba nếu không có đồng ý, trừ yêu cầu từ cơ quan pháp luật.",
  "",
  "7. GIỚI HẠN TRÁCH NHIỆM",
  "S2O không chịu trách nhiệm với thiệt hại từ: sự cố mạng/máy chủ; tấn công mạng; thiên tai;",
  "sự kiện bất khả kháng. S2O sẽ nỗ lực tối đa khôi phục hệ thống và giảm thiểu ảnh hưởng.",
  "",
  "8. THAY ĐỔI ĐIỀU KHOẢN",
  "S2O có quyền điều chỉnh, bổ sung hoặc cập nhật các điều khoản này theo từng thời kỳ. Mọi",
  "thay đổi sẽ được công bố trên nền tảng và có hiệu lực kể từ thời điểm công bố. Người dùng",
  "có trách nhiệm theo dõi và cập nhật các thay đổi.",
  "",
  "9. SERVICE LEVEL AGREEMENT (SLA)",
  "S2O cam kết uptime tối thiểu 99% mỗi tháng, không bao gồm: bảo trì đã thông báo; sự cố",
  "từ bên thứ ba; trường hợp bất khả kháng. Bảo trì định kỳ sẽ được thông báo qua email/hệ",
  "thống. S2O cung cấp hỗ trợ kỹ thuật 24/7 phân loại theo mức độ nghiêm trọng.",
  "",
  "10. DATA OWNERSHIP - QUYỀN SỬ DỤNG DỮ LIỆU",
  "Tất cả dữ liệu do nhà hàng tạo (menu, giá, đơn hàng, khách, doanh thu) thuộc quyền sở hữu",
  "của nhà hàng. S2O chỉ đóng vai trò lưu trữ và hiển thị. S2O có thể sử dụng dữ liệu ẩn danh",
  "để cải thiện dịch vụ, phân tích hiệu suất và phát triển tính năng. Nhà hàng có quyền truy",
  "cập và xuất dữ liệu của mình. Khi chấm dứt dịch vụ, nhà hàng có thể yêu cầu xuất dữ liệu",
  "trước khi tài khoản bị đóng.",
  "",
  "11. ACCEPTABLE USE POLICY (AUP) - CHÍNH SÁCH SỬ DỤNG HỢP LỆ",
  "11.1 Nguyên tắc sử dụng: Người dùng phải sử dụng S2O theo đúng mục đích hợp pháp và tuân",
  "thủ quy định pháp luật. Cam kết không sử dụng cho các mục đích gian lận, lừa đảo, hoặc vi",
  "phạm quyền lợi bên thứ ba.",
  "",
  "11.2 Các hành vi bị cấm: (a) Gian lận: tạo đơn hàng giả, sử dụng thanh toán trái phép, cung",
  "cấp thông tin sai lệch. (b) Hệ thống: truy cập trái phép, khai thác lỗi, phát tán mã độc,",
  "tấn công mạng. (c) Nội dung: nội dung bị cấm theo pháp luật, bán hàng cấm, hoạt động bất",
  "hợp pháp.",
  "",
  "11.3 Biện pháp xử lý: S2O có quyền hạn chế chức năng, tạm khóa, hoặc chấm dứt tài khoản.",
  "Có thể cung cấp thông tin cho cơ quan chức năng khi có yêu cầu hợp pháp.",
  "",
  "12. BILLING DISPUTE POLICY - CHÍNH SÁCH TRANH CHẤP THANH TOÁN",
  "12.1 Phạm vi tranh chấp: Khách hàng/nhà hàng cho rằng bị tính phí sai; hệ thống ghi nhận",
  "sai; thanh toán nhưng đơn không được ghi nhận; cần hoàn tiền do đơn hàng.",
  "",
  "12.2 Quy trình xử lý: (1) Gửi yêu cầu qua kênh hỗ trợ. (2) S2O kiểm tra thông tin, lịch sử",
  "giao dịch, dữ liệu hệ thống. (3) Liên hệ các bên để xác minh. (4) Đưa ra kết luận hoặc phương",
  "án xử lý.",
  "",
  "12.3 Thời gian xử lý: S2O sẽ xử lý trong thời gian hợp lý tùy theo mức độ phức tạp của từng",
  "trường hợp.",
  "",
  "12.4 Vai trò S2O: S2O đóng vai trò trung gian cung cấp dữ liệu giao dịch. Với tranh chấp về",
  "chất lượng món/thời gian/sai sót nhà hàng, trách nhiệm thuộc nhà hàng.",
  "",
  "13. TERMINATION POLICY - CHÍNH SÁCH CHẤM DỨT DỊCH VỤ",
  "13.1 Chấm dứt theo yêu cầu: Người dùng có quyền yêu cầu chấm dứt bất kỳ lúc nào. Tài khoản",
  "sẽ bị vô hiệu hóa sau khi tập thư nghĩa vụ. Có thể yêu cầu xuất dữ liệu.",
  "",
  "13.2 Chấm dứt do vi phạm: S2O có quyền khóa tài khoản khi: vi phạm điều khoản/chính sách;",
  "gian lận/hoạt động bất hợp pháp; gây ảnh hưởng ổn định/bảo mật; không thanh toán phí dịch",
  "vụ. Trường hợp nghiêm trọng có thể chấm dứt ngay lập tức.",
  "",
  "13.3 Xử lý dữ liệu sau chấm dứt: Người dùng có thể xuất dữ liệu trong khoảng thời gian hợp",
  "lý. S2O có thể lưu trữ cho mục đích pháp lý hoặc kiểm toán, sau đó có thể xóa.",
  "",
  "13.4 Nghĩa vụ tài chính còn tồn đọng: Chấm dứt tài khoản không làm mất hiệu lực các khoản",
  "thanh toán chưa hoàn tất. Người dùng vẫn phải hoàn tất các khoản tồn đọng.",
  "",
  "14. THÔNG TIN LIÊN HỆ",
  "Email: administrator@scan2order.id.vn",
];

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const doc = new PDFDocument({
  margin: 50,
  size: "A4",
});

const stream = fs.createWriteStream(outputFile);
doc.pipe(stream);

if (fs.existsSync(arialFontPath)) {
  doc.font(arialFontPath);
}

// Add Logo if it exists
if (fs.existsSync(logoPath)) {
  doc.image(logoPath, {
    fit: [80, 80],
    align: "center",
  });
  doc.moveDown(0.5);
}

doc.fontSize(18).text(lines[0], { align: "left" });
doc.moveDown(0.4);
doc.fontSize(11).fillColor("#444444").text(lines[1]);
doc.moveDown(1);
doc.fillColor("#000000");

for (let i = 3; i < lines.length; i += 1) {
  const line = lines[i];
  if (!line) {
    doc.moveDown(0.6);
    continue;
  }

  const isMainSectionTitle = /^\d+\./.test(line);
  const isSubSectionTitle = /^\d+\.\d+/.test(line);
  
  if (isMainSectionTitle && !isSubSectionTitle) {
    // Main section (1., 2., etc.) - add extra spacing before
    if (i > 3) {
      doc.moveDown(0.8);
    }
    doc.fontSize(13).text(line);
    doc.moveDown(0.2);
  } else if (isSubSectionTitle) {
    // Sub-section (12.1, 12.2, etc.) - indent from left
    doc.fontSize(11).text(line, {
      indent: 20,
      lineGap: 3,
      align: "left",
    });
    doc.moveDown(0.2);
  } else {
    doc.fontSize(11).text(line, {
      lineGap: 3,
      align: "left",
    });
  }
}

doc.end();

stream.on("finish", () => {
  console.log(`Generated: ${outputFile}`);
});
