<template>
    <div class="calendar-container">
        <div class="calendar">
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
                    >
                        {{ day?.day || '' }}
                    </div>
                    <img v-if="day?.date && events[day.date]" src="@/assets/images/stamp.png" class="has-data" />
                </div>
            </div>
        </div>
    </div>
    <!-- 드롭다운 창 -->
    <div
        v-if="showDropdown"
        :style="{ top: dropdownPosition.top, left: dropdownPosition.left }"
        class="dropdown-content"
    >
        <h3>{{ selectedDate }}의 데이터</h3>
        <div v-if="dayData">
            <button @click="checkData">데이터 확인</button>
        </div>
        <div v-else-if="isFutureDate(selectedDate)">
            <button @click="makeReservation">예약하기</button>
        </div>
        <div v-else>해당 날짜에 데이터가 없습니다.</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            year: new Date().getFullYear(),
            month: new Date().getMonth(),
            selectedDate: null,
            dayData: null,
            weekdays: ['일', '월', '화', '수', '목', '금', '토'],
            events: {
                '2024-10-10': '책 읽기 완료',
                '2024-10-15': '책 예약됨',
                '2024-10-20': '특별 활동 참여',
            },
            daysInMonth: [],
            loading: true,
            showDropdown: false, // 드롭다운 창의 가시성
            dropdownPosition: { top: '0px', left: '0px' }, // 드롭다운 창 위치
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
                console.log('Updated daysInMonth:', this.daysInMonth);
            });
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
            this.dayData = this.events[date] || null;

            // 드롭다운 창의 위치를 클릭된 요소의 위치로 설정
            const rect = event.target.getBoundingClientRect();
            this.dropdownPosition = {
                top: `${rect.bottom + window.scrollY}px`, // 요소의 아래쪽
                left: `${rect.left + window.scrollX}px`, // 요소의 왼쪽
            };
            this.showDropdown = true; // 드롭다운 창 표시
        },

        isFutureDate(dateString) {
            const today = new Date();
            const selected = new Date(dateString);
            return selected > today;
        },

        checkData() {
            alert(`날짜: ${this.selectedDate}의 데이터는 다음과 같습니다: ${this.dayData}`);
        },

        makeReservation() {
            alert(`날짜: ${this.selectedDate}에 예약을 진행합니다.`);
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
    border: 1px solid #365563;
    background: #fff;
    padding: 10px;
    z-index: 1000;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    transition: opacity 0.3s ease;
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
    border: none;
}
</style>
