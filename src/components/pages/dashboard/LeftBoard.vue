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
                        src="@/assets/images/stamp.png"
                        class="has-data"
                        @click.stop
                    />
                    <img
                        v-if="day?.date && futureEvents[day.date] && isFutureDay(day.date)"
                        class="has-data"
                        @click.stop
                        src="@/assets/images/reservation.png"
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
        >
            <div class="dropdown-data">
                <div class="dropdown-header">
                    <h3>{{ selectedDate }}의 동화</h3>
                </div>
                <div v-if="pastEvents[selectedDate]" class="dropdown-list">
                    <div v-for="(event, index) in pastEvents[selectedDate]" :key="index" class="list-data">
                        <img :src="event.image" class="dropdown-data-img" />
                        <p>{{ event.title }}</p>
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
                        <button @click="cancleReservation()">취소</button>
                    </div>

                    <div class="event-list-button">
                        <button @click="makeReservation()">예약하기</button>
                    </div>
                </div>
                <div v-else-if="isFutureDate(selectedDate)" class="dropdown-list">
                    <div class="event-list-button">
                        <button @click="makeReservation()">예약하기</button>
                    </div>
                </div>
                <div v-else class="dropdown-list">
                    <span>읽은동화가 없어요!( ᴗ_ᴗ̩̩ ) </span>
                </div>
            </div>
            <button class="close-button" @click="closeDropdown">x</button>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
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
                const response = await axios.get('/history.json');
                // 날짜를 키로 가지는 객체로 변환
                this.pastEvents = response.data.reduce((acc, event) => {
                    if (!acc[event.readsDay]) acc[event.readsDay] = [];
                    acc[event.readsDay].push(event);
                    return acc;
                }, {});
            } catch (error) {
                console.error('과거 정보를 가져오는 중 오류 발생:', error);
            }
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
    width: 200px;
}
.dropdown-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: left;
    width: 90%;
}
.dropdown-list {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
}
.dropdown-list p {
    margin: 0;
    font-size: medium;
    width: 60%;
    padding-left: 5px;
}
.list-data {
    width: 100%;
    display: flex;
    justify-content: left;
    align-items: center;
}
.dropdown-data-img {
    width: 20px;
    height: 20px;
    object-fit: cover;
    border-radius: 50%;
    margin-left: 5px;
}
.event-list-button {
    align-self: center;
    margin-top: 15px;
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
    height: 10%;
    font-size: 1rem;
}
li {
    list-style-type: none; /* 기본 점표시 제거 */
    padding-left: 0; /* 왼쪽 패딩 제거 */
    margin-left: 0; /* 왼쪽 마진 제거 */
}
ul {
    padding: 0;
}
</style>
