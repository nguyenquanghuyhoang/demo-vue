<template>
  <div class="cv-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="photo">
        <img src="https://via.placeholder.com/150" alt="Ảnh đại diện" />
      </div>
      <h2 class="name">{{ profile.name }}</h2>
      <p class="title">{{ profile.title }}</p>

      <section class="contact">
        <h3>Thông tin</h3>
        <ul>
          <li><strong>📞</strong> {{ profile.phone }}</li>
          <li><strong>📧</strong> {{ profile.email }}</li>
          <li><strong>📍</strong> {{ profile.address }}</li>
          <li><strong>🎂</strong> {{ profile.birth }}</li>
        </ul>
      </section>

      <section class="objective">
        <h3>Mục tiêu nghề nghiệp</h3>
        <p>{{ profile.objective }}</p>
      </section>

      <section class="skills">
        <h3>Kỹ năng</h3>
        <ul>
          <li v-for="(skill, i) in profile.skills" :key="i">{{ skill }}</li>
        </ul>
      </section>

      <section class="hobbies">
        <h3>Sở thích</h3>
        <ul>
          <li v-for="(hobby, i) in profile.hobbies" :key="i">{{ hobby }}</li>
        </ul>
      </section>
    </aside>

    <!-- Main Content -->
    <main class="content">
      <section class="education">
        <h3>Học vấn</h3>
        <div v-for="(edu, i) in profile.education" :key="i" class="item">
          <p><strong>{{ edu.time }}</strong> - {{ edu.school }}</p>
          <ul>
            <li v-for="(ach, j) in edu.achievements" :key="j">{{ ach }}</li>
          </ul>
        </div>
      </section>

      <section class="experience">
        <h3>Kinh nghiệm làm việc</h3>
        <div v-for="(exp, i) in profile.experience" :key="i" class="item">
          <p><strong>{{ exp.position }}</strong> - {{ exp.company }} ({{ exp.time }})</p>
          <ul>
            <li v-for="(task, j) in exp.tasks" :key="j">{{ task }}</li>
          </ul>
        </div>
      </section>

      <section class="awards">
        <h3>Danh hiệu và giải thưởng</h3>
        <ul>
          <li v-for="(award, i) in profile.awards" :key="i">{{ award }}</li>
        </ul>
      </section>

      <section class="certs">
        <h3>Chứng chỉ</h3>
        <ul>
          <li v-for="(cert, i) in profile.certs" :key="i">{{ cert }}</li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script setup>
const profile = {
  name: "Nguyễn Quang Huy Hoàng",
  title: "Lập trình viên",
  phone: "0356 208 805",
  email: "hoannqhpk04092@gmail.com",
  address: "Tân An, Buôn Mê Thuật",
  birth: "17/01/2006",
  objective:
    "Áp dụng các kiến thức CNTT, kỹ năng phân tích để trở thành lập trình viên giỏi...",
  skills: ["Kỹ năng giao tiếp", "Kỹ năng đàm phán", "Kỹ năng thuyết trình"],
  hobbies: ["Sở thích đọc sách", "Nấu ăn", "Du lịch"],
  education: [
    {
      time: "2014 - 2017",
      school: "Đại học TopCV",
      achievements: [
        "Tốt nghiệp loại Giỏi",
        "Đạt học bổng 2016 & 2017",
        "Đạt giải nhất nghiên cứu khoa học"
      ]
    }
  ],
  experience: [
    {
      position: "Front End Developer",
      company: "Công ty TNHH MTV SVT",
      time: "2021 - 2024",
      tasks: [
        "Xây dựng và tối ưu website bằng HTML5, CSS, JS.",
        "Hỗ trợ khách hàng và cải thiện UI/UX.",
        "Quản lý source code cùng team dev."
      ]
    },
    {
      position: "Flutter Developer",
      company: "Công ty CP công nghệ NDS",
      time: "2019 - 2021",
      tasks: [
        "Phát triển ứng dụng mobile (iOS/Android).",
        "Triển khai API kết nối server.",
        "Sửa lỗi phát sinh & tối ưu app."
      ]
    },
    {
      position: "Web Developer",
      company: "Công ty CP TopCV",
      time: "2017 - 2019",
      tasks: [
        "Phát triển giao diện web thân thiện.",
        "Thiết kế landing page quảng cáo.",
        "Viết tài liệu kỹ thuật & hướng dẫn người dùng."
      ]
    }
  ],
  awards: ["2023 - Nhân viên xuất sắc NTD", "2020 - Nhân viên cống hiến DEF"],
  certs: ["2016 - PHP, MySQL, JavaScript"]
};
</script>

<style scoped>
.cv-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  width: 100%;
  max-width: 1000px;
  margin: auto;
  background: #fff;
  border: 1px solid #ccc;
}

.sidebar {
  background: #eaf4e1;
  padding: 20px;
}

.sidebar .photo img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: block;
  margin: 0 auto 10px;
}

.sidebar h2 {
  text-align: center;
  margin: 10px 0 5px;
}

.sidebar p.title {
  text-align: center;
  color: #555;
  font-size: 14px;
}

.sidebar h3 {
  margin-top: 20px;
  color: #333;
  font-size: 16px;
  border-bottom: 1px solid #ccc;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar ul li {
  padding: 5px 0;
}

.content {
  padding: 20px;
}

.content h3 {
  margin-top: 20px;
  color: #2c3e50;
  border-bottom: 2px solid #2c3e50;
}

.item {
  margin-bottom: 15px;
}

.item p {
  font-weight: bold;
  margin: 5px 0;
}

.item ul {
  margin: 0;
  padding-left: 20px;
}

.item ul li {
  list-style: disc;
  margin: 3px 0;
}
</style> 