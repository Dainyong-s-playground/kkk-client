<template>
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-section brand">
                <h3>동화 읽어주는 AI</h3>
                <p>© 2024 다이뇽.</p>
            </div>
            <div class="footer-section links">
                <h3>빠른 링크</h3>
                <ul>
                    <li><router-link to="/">메인페이지</router-link></li>
                    <li><router-link to="/mypage">마이페이지</router-link></li>
                    <li><router-link to="/dashboard">부모 대시보드</router-link></li>
                    <li><router-link to="/fairyTaleList">동화 리스트</router-link></li>
                </ul>
            </div>
            <div class="footer-section team">
                <h3>팀 정보</h3>
                <div class="team-members">
                    <div class="member">
                        <strong>김찬희 <span>(팀장)</span></strong>
                        <div>______@gmail.com</div>
                    </div>
                    <div class="member">
                        <strong>권대용 <span>(팀원)</span></strong>
                        <div>cys964@gmail.com</div>
                    </div>
                    <div class="member">
                        <strong>김범철 <span>(팀원)</span></strong>
                        <div>dnldks12@gmail.com</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>
                <a href="https://www.flaticon.com/kr/free-icons/-" title="전체 화면 아이콘"
                    >아이콘 제작자: Google - Flaticon</a
                >
            </p>
            <p>동화 저작권: 각 동화의 저작권은 해당 작가 및 출판사에 있습니다.</p>
        </div>
    </footer>
</template>

<script>
export default {
    name: 'FooterCompo',
};
</script>

<style scoped>
.footer-content {
    display: flex;
    text-align: center;
    justify-content: space-between;
    flex-wrap: wrap;
    margin: 0 auto;
    padding: 0 20px;
    gap: 80px;
}

.footer-section {
    flex: 1;
    min-width: 220px;
    margin-bottom: 30px;
}

.footer-section h3 {
    font-size: 2rem;
    margin-bottom: 20px;
    color: rgb(155, 190, 78);
    font-weight: 700;
}

.footer-section p,
.footer-section a {
    font-size: 1rem;
    line-height: 1.6;
    color: #bdc3c7;
    text-decoration: none;
    transition: color 0.3s ease;
}

.footer-section a:hover {
    color: rgba(155, 190, 78, 0.715);
}

.links ul {
    list-style: none;
    padding: 0;
}

.links li {
    margin-bottom: 10px;
}
.member {
    text-align: end;
}
.member div {
    color: #bdc3c7;
}
.member span {
    color: #bdc3c7;
    font-size: 0.8rem;
}

.team-members .member {
    margin-bottom: 15px;
}

.team-members strong {
    font-size: 1.5rem;
    display: block;
    color: rgba(157, 157, 157, 0.759);
}

.footer-bottom {
    text-align: center;
    padding-top: 20px;
    margin-top: 30px;
    border-top: 1px solid rgb(155, 190, 78);
    font-size: 0.9rem;
    width: 80%;
    color: #95a5a6;
}

.footer-bottom a {
    color: rgb(155, 190, 78);
    text-decoration: none;
}

.footer-bottom a:hover {
    text-decoration: underline;
}

.footer-bottom p {
    font-size: 1rem;
}

@media (max-width: 768px) {
    .footer-content {
        flex-direction: column;
    }

    .footer-section {
        width: 100%;
        text-align: center;
    }

    .team-members {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }

    .team-members .member {
        margin: 0 15px 15px;
    }
}
</style>
