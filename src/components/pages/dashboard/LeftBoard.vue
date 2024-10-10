<template>
    <div class="calendar-container" @click="closeDropdown">
        <div class="calendar" @click.stop>
            <div class="calendar-header">
                <button @click="prevMonth">◀</button>
                <span>{{ year }}년 {{ month + 1 }}월</span>
                <button @click="nextMonth">▶</button>
            </div>
            <div class="calendar-weekdays">
                <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
            </div>
            <div v-if="daysInMonth.length" class="calendar-days">
                <div
                    class="cal-day"
                    :class="{ today: day?.date && isToday(day.date) }"
                    v-for="day in daysInMonth"
                    :key="day?.date || day"
                    @click="day?.date && handleDayClick(day.date, $event)"
                >
                    <div
                        class="day"
                        :class="{
                            weekend: day?.date && isWeekend(day.date),
                            'empty-day': !day,
                        }"
                        @click.stop
                    >
                        {{ day?.day || '' }}
                    </div>
                    <img
                        v-if="day?.date && pastEvents[day.date]"
                        src="https://dainyong-s-playground.github.io/imageServer/src/stamp.png"
                        class="has-data"
                        @click.stop
                    />
                    <img
                        v-if="day?.date && futureEvents[day.date] && isFutureDay(day.date)"
                        class="has-data"
                        @click.stop
                        src="https://dainyong-s-playground.github.io/imageServer/src/reservation.png"
                    />
                </div>
                <!-- 미래 예약 이벤트가 존재할 경우 -->
            </div>
        </div>
        <!-- 드롭다운 창 -->
        <div
            v-if="showDropdown"
            :style="{ top: dropdownPosition.top, left: dropdownPosition.left }"
            class="dropdown-content"
            @click.stop
        >
            <div class="dropdown-data">
                <div class="dropdown-header">
                    <h3>{{ selectedDate }}의 동화</h3>
                </div>

                <div v-if="pastEvents[selectedDate]" class="dropdown-list">
                    <div v-for="(event, index) in pastEvents[selectedDate]" :key="index" class="list-data">
                        <img :src="event.fairyTaleImage" class="dropdown-data-img" />
                        <p>{{ event.fairyTaleTitle }}</p>
                        <!-- 예약 여부 체크박스 (읽기 전용) -->
                        <input
                            type="checkbox"
                            class="reservation-checkbox"
                            :checked="isReserved(event.readsDay, event.title)"
                            disabled
                        />
                    </div>
                </div>

                <div v-else-if="isFutureDate(selectedDate) && futureEvents[selectedDate]" class="dropdown-list">
                    <div
                        v-for="(event, index) in Array.isArray(futureEvents[selectedDate])
                            ? futureEvents[selectedDate]
                            : [futureEvents[selectedDate]]"
                        :key="index"
                        class="list-data"
                    >
                        <img v-if="event.image" :src="event.image" class="dropdown-data-img" />
                        <p>{{ event.title }}</p>
                        <button @click="cancleReservation()">x</button>
                    </div>

                    <button @click="makeReservation()" class="event-list-button">예약하기</button>
                </div>
                <div v-else-if="isFutureDate(selectedDate)" class="dropdown-list">
                    <button @click="makeReservation()" class="event-list-button">예약하기</button>
                </div>
                <div v-else class="dropdown-list">
                    <span>읽은동화가 없어요!( ᴗ_ᴗ̩̩ ) </span>
                </div>

                <!-- 댓글 출력 필드 -->
                <div
                    v-if="pastEvents[selectedDate] && pastEvents[selectedDate][0]?.dailyComment"
                    class="comment-display"
                >
                    <h4>엄마의 한말씀</h4>
                    <p class="comment-text">
                        {{ pastEvents[selectedDate][0].dailyComment }}
                        <span v-if="pastEvents[selectedDate][0].useComplimentBadge" class="compliment-badge"> 👍 </span>
                    </p>
                </div>

                <!-- 댓글 작성 필드 (오늘 이전 날짜일 때만 표시) -->
                <div class="comment-section" v-else-if="isPastDate(selectedDate)">
                    <h4>내아이 칭찬타임</h4>
                    <input
                        type="text"
                        v-model="dailyComment"
                        class="comment-input"
                        placeholder="오늘의 독서 활동에 대한 총평을 작성하세요..."
                    />
                    <div class="badge-setting">
                        <input type="checkbox" v-model="useComplimentBadge" /> 칭찬도장 추가
                    </div>
                    <button @click="submitDailyComment(selectedDate)" class="comment-button">댓글 작성</button>
                </div>
            </div>
            <button class="close-button" @click="closeDropdown">x</button>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { useProfileStore } from '@/stores/profile';
import { storeToRefs } from 'pinia';

export default {
    setup() {
        const profileStore = useProfileStore();
        const { selectedProfile } = storeToRefs(profileStore);
        return { profileStore, selectedProfile };
    },
    data() {
        return {
            year: new Date().getFullYear(),
            month: new Date().getMonth(),
            selectedDate: null,
            dayData: null,
            weekdays: ['일', '월', '화', '수', '목', '금', '토'],
            pastEvents: {}, // 과거 데이터 저장 객체 (날짜를 키로)
            futureEvents: {}, // 예약 데이터 저장 객체
            daysInMonth: [],
            loading: true,
            showDropdown: false,
            dropdownPosition: { top: '0px', left: '0px' },
            dailyComment: '', // 댓글 입력 필드 상태
            commentData: {},
            useComplimentBadge: false, // 칭찬도장 여부
        };
    },
    watch: {
        year() {
            this.updateDaysInMonth();
        },
        month() {
            this.updateDaysInMonth();
        },
    },
    mounted() {
        this.updateDaysInMonth();
        this.updatePastEvents();
        this.updateFutureEvents();
        // this.loadComments(); // 댓글 데이터 로드
        document.addEventListener('keydown', this.handleKeydown);
        window.addEventListener('message', this.handleMessage, false);
    },
    beforeUnmount() {
        document.removeEventListener('keydown', this.handleKeydown);
        window.removeEventListener('message', this.handleMessage, false);
    },
    methods: {
        async updateDaysInMonth() {
            this.loading = true;

            const date = new Date(Date.UTC(this.year, this.month, 1));
            const firstDay = date.getUTCDay();
            const days = [];

            for (let i = 0; i < firstDay; i++) {
                days.push(null);
            }

            while (date.getUTCMonth() === this.month) {
                const formattedDate = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
                    2,
                    '0',
                )}-${String(date.getUTCDate()).padStart(2, '0')}`;
                days.push({ day: date.getUTCDate(), date: formattedDate });

                date.setUTCDate(date.getUTCDate() + 1);
            }

            this.daysInMonth = days;

            this.$nextTick(() => {
                this.loading = false;
            });
        },
        async updatePastEvents() {
            try {
                const historyResponse = await axios.get(
                    `http://localhost:7772/api/dashboard/pastData/${this.profileStore.selectedProfile.id}`,
                );
                // 날짜를 키로 가지는 객체로 변환
                this.pastEvents = historyResponse.data.reduce((acc, event) => {
                    if (!acc[event.readsDay]) acc[event.readsDay] = [];
                    acc[event.readsDay].push(event);
                    return acc;
                }, {});
                const commentResponse = await axios.get(
                    `http://localhost:7772/api/dashboard/comment/${this.profileStore.selectedProfile.id}`,
                );
                const commentData = commentResponse.data;

                // 날짜별로 댓글을 히스토리에 병합
                commentData.forEach((comment) => {
                    if (this.pastEvents[comment.readsDay]) {
                        this.pastEvents[comment.readsDay].forEach((event) => {
                            event.dailyComment = comment.dailyComment;
                            event.useComplimentBadge = comment.useComplimentBadge;
                        });
                    }
                });
            } catch (error) {
                console.error('과거 정보를 가져오는 중 오류 발생:', error);
            }
        },
        saveComment(event, date) {
            if (!event.comment || event.comment.trim() === '') return;
            // 새로운 댓글 추가
            event.comments.push(event.comment);
            event.comment = ''; // 입력 필드 초기화
            console.log(`날짜: ${date}의 이벤트에 댓글이 추가되었습니다.`);
        },
        async updateFutureEvents() {
            try {
                const response = await axios.get('/futureData.json');
                this.futureEvents = response.data.reduce((acc, event) => {
                    acc[event.readsDay] = event;
                    return acc;
                }, {});
            } catch (error) {
                console.error('미래 예약 정보를 가져오는 중 오류 발생:', error);
            }
            console.log('예약데이터:' + this.futureEvents);
        },
        isWeekend(dateString) {
            const date = new Date(dateString);
            const dayOfWeek = date.getUTCDay();
            return dayOfWeek === 0 || dayOfWeek === 6;
        },
        isToday(dateString) {
            const today = new Date().toISOString().slice(0, 10);
            console.log(dateString);
            return today === dateString;
        },
        prevMonth() {
            if (this.month === 0) {
                this.month = 11;
                this.year -= 1;
            } else {
                this.month -= 1;
            }
            this.updateDaysInMonth();
        },
        nextMonth() {
            if (this.month === 11) {
                this.month = 0;
                this.year += 1;
            } else {
                this.month += 1;
            }
            this.updateDaysInMonth();
        },
        handleDayClick(date, event) {
            this.selectedDate = date;

            const rect = event.target.getBoundingClientRect();
            this.dropdownPosition = {
                top: `${rect.bottom + window.scrollY}px`,
                left: `${rect.left + window.scrollX}px`,
            };

            this.showDropdown = true;
            console.log('드롭다운활성화');
        },
        isFutureDate(dateString) {
            const today = new Date();
            const selected = new Date(dateString);
            return selected > today;
        },
        isReserved(readsDay, title) {
            console.log(readsDay, title);
            const events = this.futureEvents[readsDay];
            if (!events) {
                return false;
            } else {
                if (events.title === title) {
                    return true;
                } else {
                    return false;
                }
            }

            // return !!this.futureEvents[readsDay] && !!this.futureEvents[title];
        },
        makeReservation() {
            const searchUrl = `/search?selectedDate=${this.selectedDate}`;
            window.open(searchUrl, 'searchWindow', 'width=800,height=600');
        },
        cancleReservation() {
            // async axios.post('https://',{예약번호});
            alert('예약취소!');
        },
        closeDropdown() {
            this.showDropdown = false;
        },
        handleKeydown(event) {
            if (event.key === 'Escape' || event.key === 'Esc') {
                this.closeDropdown();
            }
        },
        handleMessage(event) {
            if (event.origin !== window.location.origin) return; // 동일 출처 확인
            const { story, selectedDate } = event.data;
            if (story && selectedDate) {
                this.futureEvents = {
                    ...this.futureEvents,
                    [selectedDate]: story,
                };
                alert(`날짜: ${selectedDate}에 '${story.title}' 동화가 추가되었습니다.`);
            }
        },
        isFutureDay(dateString) {
            const today = new Date();
            const selectedDate = new Date(dateString);

            // 오늘 날짜보다 이후인 경우에만 true 반환
            return selectedDate >= today.setHours(0, 0, 0, 0);
        },

        async submitDailyComment(date) {
            try {
                const commentData = {
                    date: date,
                    comment: this.dailyComment,
                    useComplimentBadge: this.useComplimentBadge,
                };

                // 백엔드로 POST 요청 전송
                await axios.post('/api/comments', commentData);

                // UI에 반영
                this.$set(this.pastEvents, date, {
                    ...this.pastEvents[date],
                    dailyComment: this.dailyComment,
                    useComplimentBadge: this.useComplimentBadge,
                });

                this.dailyComment = '';
                this.useComplimentBadge = false;
            } catch (error) {
                console.error('댓글 저장 중 오류 발생:', error);
            }
        },

        // 오늘 이전 날짜인지 확인
        isPastDate(dateString) {
            const today = new Date().toISOString().slice(0, 10);
            return dateString < today;
        },
    },
};
</script>
<style scoped>
.loading {
    text-align: center;
    font-size: 1.5rem;
    margin-top: 200px;
}

.calendar-container {
    margin-top: 20px;
    padding-top: 20px;
    width: 60%;
    height: 700px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.calendar {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    width: 80%;
    margin-bottom: 20px;
    font-size: 1.5rem;
}

.calendar-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    width: 90%;
    margin-bottom: 10px;
    font-weight: bold;
}

.weekday {
    text-align: center;
}

.calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
    width: 90%;
    height: 80%;
}

.cal-day {
    display: flex;
    cursor: pointer;
    border: 1px solid #f0c674;
    position: relative;
}

.day {
    cursor: pointer;
    font-size: 1.2rem;
    width: 60px;
    height: 60px;
}

.has-data {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 50%;
}

.weekend {
    color: #f44336;
}

.empty-day {
    background: none;
    pointer-events: none;
}

.dropdown-content {
    position: absolute;
    border: 1px solid #f0c674;
    background: #fff;
    display: flex;
    padding: 10px;
    border-radius: 10px;
    z-index: 1000;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    transition: opacity 0.3s ease;
    width: 400px;
}
.dropdown-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: left;
    width: 100%;
}
.dropdown-list {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    border: 1px solid #f0c674;
    border-radius: 10px;
    margin-bottom: 10px;
}
.dropdown-list p {
    margin: 0;
    font-size: medium;
    width: 70%;
    padding-left: 5px;
}
.dropdown-list span {
    padding: 10px;
}
.list-data {
    width: 100%;
    display: flex;
    justify-content: left;
    align-items: center;
    padding: 10px;
}
.dropdown-data-img {
    width: 50px;
    object-fit: cover;
    border-radius: 10px;
    margin-left: 5px;
}
.event-list-button {
    background-color: #4caf50;
    color: white;
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    width: 50%;
    align-self: center;
    margin: 10px;
}
.profile-container {
    width: 100%;
    height: 200px;
    border: 1px solid #365563;
    margin-top: 20px;
    padding: 10px;
    text-align: center;
    font-size: 1.2rem;
}

button {
    background: none;
    border: 1px solid #2b2929;
    border-radius: 5px;
}

.close-button {
    font-size: 1rem;
    border-radius: 50%;
    border: 1px solid #7e7e7e;
    background: #7e7e7e;
    color: #fff;
    position: absolute;
    right: 10px;
    top: 10px;
}
li {
    list-style-type: none; /* 기본 점표시 제거 */
    padding-left: 0; /* 왼쪽 패딩 제거 */
    margin-left: 0; /* 왼쪽 마진 제거 */
}
ul {
    padding: 0;
}
.today {
    background-color: #f2e88d; /* 오늘 날짜의 배경색 노란색으로 설정 */
}

/* 스타일 정의 */
.comment-section {
    margin-top: 10px;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border: 1px solid #f0c674;
    border-radius: 10px;
}

.comment-input {
    width: 95%;
    height: 20px;
    margin: 10px;
}

.comment-button {
    background-color: #4caf50;
    color: white;
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    width: 50%;
    align-self: center;
    margin-bottom: 20px;
}

.comment-display {
    width: 100%;
    border: 1px solid #f0c674;
    border-radius: 10px;
}

.comment-text {
    padding: 10px;
}

.compliment-badge {
    padding: 2px 6px;
    border-radius: 3px;
    margin-left: 5px;
}

.badge-setting {
    display: flex;
    align-items: center;
    margin-left: 10px;
    margin-bottom: 10px;
}

.badge-setting input {
    margin-right: 5px;
}

.dropdown-content h4 {
    margin: 0;
    padding: 10px;
}
.dropdown-content p {
    margin: 0;
    padding: 10px;
}
</style>
