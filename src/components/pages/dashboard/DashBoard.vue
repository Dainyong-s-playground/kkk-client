<template>
    <div class="dash-container">
        <div class="calendar-container">
            <div class="calendar">
                <div class="calendar-header">
                    <button @click="prevMonth">◀</button>
                    <span>{{ year }}년 {{ month + 1 }}월</span>
                    <button @click="nextMonth">▶</button>
                </div>
                <!-- 요일 표시 영역 추가 -->
                <div class="calendar-weekdays">
                    <div v-for="day in weekdays" :key="day" class="weekday">
                        {{ day }}
                    </div>
                </div>
                <!-- daysInMonth가 완전히 계산된 후에만 렌더링 -->
                <div v-if="daysInMonth.length" class="calendar-days">
                    <div
                        class="cal-day"
                        v-for="day in daysInMonth"
                        :key="day?.date || day"
                        @click="day?.date && handleDayClick(day.date)"
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

            // UTC 기준으로 `Date` 객체 생성
            const date = new Date(Date.UTC(this.year, this.month, 1));
            const firstDay = date.getUTCDay(); // `getDay` 대신 `getUTCDay` 사용
            const days = [];

            console.log(`Calculating days for Year: ${this.year}, Month: ${this.month}, First Day: ${firstDay}`);

            // 빈칸 채우기
            for (let i = 0; i < firstDay; i++) {
                days.push(null);
            }

            // 해당 월의 날짜 추가
            while (date.getUTCMonth() === this.month) {
                const formattedDate = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
                    2,
                    '0',
                )}-${String(date.getUTCDate()).padStart(2, '0')}`;
                days.push({ day: date.getUTCDate(), date: formattedDate });

                // 날짜를 직접 설정하여 UTC 시간대로 변경
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
            const dayOfWeek = date.getUTCDay(); // `getDay` 대신 `getUTCDay` 사용
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

        handleDayClick(date) {
            this.selectedDate = date;
            this.dayData = this.events[date] || null;
        },
    },
};
</script>
<style scoped>
.dash-container {
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 100px;
}

.calendar-container {
    width: 60%;
    height: 700px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.graph-container {
    width: 25%;
    height: 700px;
    display: flex;
    flex-direction: column;
    justify-content: center;
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
    justify-content: space-between;
    cursor: pointer;
    border: 1px solid #f0c674;
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
.profile-container {
    width: 100%;
    height: 200px;
    border: 1px solid #365563;
    margin-top: 20px;
    padding: 10px;
    text-align: center;
    font-size: 1.2rem;
}
</style>
