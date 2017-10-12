import { expect } from 'chai';

import { db } from '~/db/init';
import { Factory, RawFactory } from '~/test/Factory';

import * as Course from '../index';
import * as ProblemUserIsLearning from '~/components/problemsUserIsLearning/model';

describe('coursesUserIsLearning:model:select', () => {
  describe('idsOfProblemsToLearnAndReviewPerCourse', () => {
    beforeEach('truncating db', async () =>
      db.none('TRUNCATE TABLE problem, course, "user", problem_user_is_learning, course_user_is_learning RESTART IDENTITY CASCADE')
    );

    it('=> {} for new users', async () => {
      const user = await RawFactory.user({});
      const result = Course.select.idsOfProblemsToLearnAndReviewPerCourse(user.id);
      expect(result).to.deep.equal({});
    });

    it('=> toLearn: [problemId] after user starts learning a course', async () => {
      // create user
      const user = await RawFactory.user({});

      // create course with 1 problem
      const course = await Factory.course({});
      const problem = await RawFactory.problem({ courseId: course.id });

      // make user learn this course
      await RawFactory.courseUserIsLearning({
        courseId: course.id,
        userId: user.id,
        active: true
      });

      const result = await Course.select.idsOfProblemsToLearnAndReviewPerCourse(user.id);
      expect(result).to.deep.equal({ [course.id]: { toLearn: [problem.id], toReview: [] } });
    });

    it('=> toReview: [problemId] after user learned a problem', async () => {
      // create user
      const user = await RawFactory.user({});

      // create course with 2 problems
      const course = await Factory.course({});
      const problem_1 = await RawFactory.problem({ courseId: course.id });
      const problem_2 = await RawFactory.problem({ courseId: course.id });

      // make user learn this course
      const cuil = await RawFactory.courseUserIsLearning({
        courseId: course.id,
        userId: user.id,
        active: true
      });

      // learn one problem
      await ProblemUserIsLearning.insert.create({
        courseUserIsLearningId: cuil.id,
        problemId: problem_1.id
      });

      const result = await Course.select.idsOfProblemsToLearnAndReviewPerCourse(user.id);
      expect(result).to.deep.equal({ [course.id]: { toLearn: [problem_2.id], toReview: [problem_1.id] } });
    });

    it('=> toLearn: [] for course with no problems', async () => {
      // create user
      const user = await RawFactory.user({});

      // create course without problems
      const course = await Factory.course({});

      // make user learn this course
      await RawFactory.courseUserIsLearning({
        courseId: course.id,
        userId: user.id,
        active: true
      });

      const result = await Course.select.idsOfProblemsToLearnAndReviewPerCourse(user.id);
      expect(result).to.deep.equal({ [course.id]: { toLearn: [], toReview: [] } });
    });
  });
});